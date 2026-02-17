// Functions to save and load favorite recommendations
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Save a recommendation to favorites
export async function saveFavorite(userId, recommendation) {
  try {
    await addDoc(collection(db, 'favorites'), {
      userId: userId,
      title: recommendation.title,
      description: recommendation.description,
      savedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving favorite:', error);
    return { success: false, error: error.message };
  }
}

// Remove a recommendation from favorites
export async function removeFavorite(favoriteId) {
  try {
    await deleteDoc(doc(db, 'favorites', favoriteId));
    return { success: true };
  } catch (error) {
    console.error('Error removing favorite:', error);
    return { success: false, error: error.message };
  }
}

// Get all favorites for a user
export async function getFavorites(userId) {
  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const favorites = [];
    snapshot.forEach((doc) => {
      favorites.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return { success: true, favorites };
  } catch (error) {
    console.error('Error getting favorites:', error);
    return { success: false, error: error.message, favorites: [] };
  }
}

// Check if a recommendation is already saved
export async function isFavorite(userId, title) {
  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('title', '==', title)
    );
    const snapshot = await getDocs(q);
    return { isSaved: !snapshot.empty, docId: snapshot.docs[0]?.id };
  } catch (error) {
    console.error('Error checking favorite:', error);
    return { isSaved: false };
  }
}
