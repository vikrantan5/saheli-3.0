import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

/**
 * Create a new safety marker
 * @param {Object} markerData - Marker data
 * @param {Object} markerData.coordinates - {latitude, longitude}
 * @param {string} markerData.status - 'safe', 'caution', or 'unsafe'
 * @param {string} markerData.note - Optional description
 * @returns {Promise<string>} - Document ID of created marker
 */
export const createSafetyMarker = async (markerData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to create a safety marker');
    }

    const marker = {
      userId: currentUser.uid,
      coordinates: markerData.coordinates,
      status: markerData.status, // 'safe', 'caution', 'unsafe'
      note: markerData.note || '',
      timestamp: serverTimestamp(),
      upvotes: 0,
      upvoters: [],
      verified: false,
    };

    console.log('Creating safety marker:', marker);

    const docRef = await addDoc(collection(db, 'safety_markers'), marker);
    console.log('✅ Safety marker created successfully with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating safety marker:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time safety markers updates
 * @param {Function} callback - Callback function that receives markers array
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToSafetyMarkers = (callback) => {
  try {
    const q = query(
      collection(db, 'safety_markers'),
      orderBy('timestamp', 'desc')
    );

    console.log('📡 Subscribing to safety markers...');

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const markers = [];
        querySnapshot.forEach((doc) => {
          markers.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          });
        });
        
        console.log(`✅ Received ${markers.length} safety markers from Firestore`);
        callback(markers);
      },
      (error) => {
        console.error('❌ Error in safety markers subscription:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up safety markers subscription:', error);
    return () => {};
  }
};

/**
 * Upvote a safety marker (atomic operation)
 * @param {string} markerId - Marker document ID
 * @returns {Promise<void>}
 */
export const upvoteSafetyMarker = async (markerId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to upvote');
    }

    const markerRef = doc(db, 'safety_markers', markerId);

    await runTransaction(db, async (transaction) => {
      const markerDoc = await transaction.get(markerRef);
      
      if (!markerDoc.exists()) {
        throw new Error('Marker does not exist');
      }

      const markerData = markerDoc.data();
      const upvoters = markerData.upvoters || [];
      const currentUpvotes = markerData.upvotes || 0;

      if (upvoters.includes(currentUser.uid)) {
        // Remove upvote
        transaction.update(markerRef, {
          upvotes: currentUpvotes - 1,
          upvoters: upvoters.filter(uid => uid !== currentUser.uid),
          verified: (currentUpvotes - 1) >= 5,
        });
        console.log('👎 Removed upvote from marker:', markerId);
      } else {
        // Add upvote
        transaction.update(markerRef, {
          upvotes: currentUpvotes + 1,
          upvoters: [...upvoters, currentUser.uid],
          verified: (currentUpvotes + 1) >= 5,
        });
        console.log('👍 Added upvote to marker:', markerId);
      }
    });

    console.log('✅ Upvote transaction completed successfully');
  } catch (error) {
    console.error('❌ Error upvoting marker:', error);
    throw error;
  }
};

/**
 * Check if current user has upvoted a marker
 * @param {Array} upvoters - Array of user IDs who upvoted
 * @returns {boolean}
 */
export const hasUserUpvotedMarker = (upvoters) => {
  const currentUser = auth.currentUser;
  if (!currentUser || !upvoters) return false;
  return upvoters.includes(currentUser.uid);
};

/**
 * Get markers by status
 * @param {string} status - 'safe', 'caution', or 'unsafe'
 * @returns {Promise<Array>}
 */
export const getMarkersByStatus = async (status) => {
  try {
    const q = query(
      collection(db, 'safety_markers'),
      where('status', '==', status)
    );
    
    const querySnapshot = await getDocs(q);
    const markers = [];
    querySnapshot.forEach((doc) => {
      markers.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      });
    });
    
    return markers;
  } catch (error) {
    console.error('Error getting markers by status:', error);
    return [];
  }
};

/**
 * Calculate if a location is within danger zone
 * @param {Object} location - {latitude, longitude}
 * @param {Array} unsafeMarkers - Array of unsafe markers
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Object|null} - Returns closest unsafe marker if within radius
 */
export const isLocationInDangerZone = (location, unsafeMarkers, radiusKm = 0.5) => {
  for (const marker of unsafeMarkers) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      marker.coordinates.latitude,
      marker.coordinates.longitude
    );
    
    if (distance <= radiusKm) {
      return { ...marker, distance };
    }
  }
  return null;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};
