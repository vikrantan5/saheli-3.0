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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from '../config/firebaseConfig';
import { getUserDetails } from './userService';

/**
 * Create a new community post
 * @param {Object} postData - Post data
 * @param {string} postData.content - Post content/message
 * @param {string} postData.category - Category: 'safety-alerts', 'support', or 'general'
 * @param {boolean} postData.isAnonymous - Whether post is anonymous
 * @param {string} postData.imageUri - Optional image URI
 * @returns {Promise<string>} - Document ID of created post
 */
export const createPost = async (postData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to create a post');
    }

    // Get user details for username
    const userDetails = await getUserDetails(currentUser.uid);
    const username = userDetails?.name || 'Anonymous User';

    // Prepare post object
    const post = {
      userId: currentUser.uid,
      username: postData.isAnonymous ? 'Anonymous' : username,
      isAnonymous: postData.isAnonymous || false,
      category: postData.category,
      content: postData.content,
      timestamp: serverTimestamp(),
      upvotes: 0,
      upvoters: [],
      imageUrl: postData.imageUrl || null,
    };

    console.log('Creating post:', post);

    // Add post to Firestore
    const docRef = await addDoc(collection(db, 'community_posts'), post);
    console.log('✅ Post created successfully with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating post:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time posts updates
 * @param {string} category - Filter by category ('all', 'safety-alerts', 'support', 'general')
 * @param {Function} callback - Callback function that receives posts array
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToPosts = (category, callback) => {
  try {
    let q;
    
    if (category === 'all') {
      // Get all posts, ordered by timestamp descending
      q = query(
        collection(db, 'community_posts'),
        orderBy('timestamp', 'desc')
      );
    } else {
      // Filter by category
      q = query(
        collection(db, 'community_posts'),
        where('category', '==', category),
        orderBy('timestamp', 'desc')
      );
    }

    console.log('📡 Subscribing to posts with category:', category);

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const posts = [];
        querySnapshot.forEach((doc) => {
          posts.push({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamp to JavaScript Date
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          });
        });
        
        console.log(`✅ Received ${posts.length} posts from Firestore`);
        callback(posts);
      },
      (error) => {
        console.error('❌ Error in posts subscription:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up posts subscription:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Upvote a post (atomic operation, one vote per user)
 * @param {string} postId - Post document ID
 * @returns {Promise<void>}
 */
export const upvotePost = async (postId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to upvote');
    }

    const postRef = doc(db, 'community_posts', postId);

    // Use transaction to ensure atomic updates
    await runTransaction(db, async (transaction) => {
      const postDoc = await transaction.get(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post does not exist');
      }

      const postData = postDoc.data();
      const upvoters = postData.upvoters || [];
      const currentUpvotes = postData.upvotes || 0;

      // Check if user has already upvoted
      if (upvoters.includes(currentUser.uid)) {
        // Remove upvote
        transaction.update(postRef, {
          upvotes: currentUpvotes - 1,
          upvoters: upvoters.filter(uid => uid !== currentUser.uid),
        });
        console.log('👎 Removed upvote from post:', postId);
      } else {
        // Add upvote
        transaction.update(postRef, {
          upvotes: currentUpvotes + 1,
          upvoters: [...upvoters, currentUser.uid],
        });
        console.log('👍 Added upvote to post:', postId);
      }
    });

    console.log('✅ Upvote transaction completed successfully');
  } catch (error) {
    console.error('❌ Error upvoting post:', error);
    throw error;
  }
};

/**
 * Check if current user has upvoted a post
 * @param {Array} upvoters - Array of user IDs who upvoted
 * @returns {boolean}
 */
export const hasUserUpvoted = (upvoters) => {
  const currentUser = auth.currentUser;
  if (!currentUser || !upvoters) return false;
  return upvoters.includes(currentUser.uid);
};

/**
 * Check if a post is critical (needs attention)
 * @param {number} upvotes - Number of upvotes
 * @returns {boolean}
 */
export const isCriticalPost = (upvotes) => {
  return upvotes >= 10;
};

/**
 * Get user's post count
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of posts by user
 */
export const getUserPostCount = async (userId) => {
  try {
    if (!userId) return 0;
    
    const q = query(
      collection(db, 'community_posts'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting user post count:', error);
    return 0;
  }
};
