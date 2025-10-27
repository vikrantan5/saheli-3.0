import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Save user details to Firestore
 * @param {string} uid - User ID from Firebase Auth
 * @param {Object} userData - User data object
 * @returns {Promise<void>}
 */
export const saveUserDetails = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      name: userData.name,
      address: userData.address,
      occupation: userData.occupation,
      emergencyContacts: userData.emergencyContacts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('User details saved successfully');
  } catch (error) {
    console.error('Error saving user details:', error);
    throw error;
  }
};

/**
 * Get user details from Firestore
 * @param {string} uid - User ID from Firebase Auth
 * @returns {Promise<Object|null>}
 */
export const getUserDetails = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.log('No user details found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
};

/**
 * Update user details in Firestore
 * @param {string} uid - User ID from Firebase Auth
 * @param {Object} userData - User data object to update
 * @returns {Promise<void>}
 */
export const updateUserDetails = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('User details updated successfully');
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
};
