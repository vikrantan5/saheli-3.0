import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

const VIDEOS_COLLECTION = 'safetyVideos';

/**
 * Add a new safety video
 */
export const addVideo = async (videoData) => {
  try {
    const { title, description, youtubeUrl, thumbnailUrl } = videoData;

    if (!title || !youtubeUrl) {
      throw new Error('Title and YouTube URL are required');
    }

    const videoRef = await addDoc(collection(db, VIDEOS_COLLECTION), {
      title,
      description: description || '',
      youtubeUrl,
      thumbnailUrl: thumbnailUrl || getYouTubeThumbnail(youtubeUrl),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Video added successfully:', videoRef.id);
    return videoRef.id;
  } catch (error) {
    console.error('❌ Error adding video:', error);
    throw error;
  }
};

/**
 * Get all safety videos
 */
export const getAllVideos = async () => {
  try {
    const videosQuery = query(
      collection(db, VIDEOS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(videosQuery);

    const videos = [];
    querySnapshot.forEach((doc) => {
      videos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return videos;
  } catch (error) {
    console.error('❌ Error fetching videos:', error);
    throw error;
  }
};

/**
 * Update a video
 */
export const updateVideo = async (videoId, videoData) => {
  try {
    const videoRef = doc(db, VIDEOS_COLLECTION, videoId);
    await updateDoc(videoRef, {
      ...videoData,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Video updated successfully');
  } catch (error) {
    console.error('❌ Error updating video:', error);
    throw error;
  }
};

/**
 * Delete a video
 */
export const deleteVideo = async (videoId) => {
  try {
    const videoRef = doc(db, VIDEOS_COLLECTION, videoId);
    await deleteDoc(videoRef);

    console.log('✅ Video deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting video:', error);
    throw error;
  }
};

/**
 * Extract YouTube video ID from URL
 */
export const getYouTubeVideoId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)).*v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

/**
 * Get YouTube thumbnail URL
 */
export const getYouTubeThumbnail = (url) => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
};

/**
 * Get YouTube embed URL
 */
export const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};
