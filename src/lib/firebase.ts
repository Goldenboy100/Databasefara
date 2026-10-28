import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence, signInWithRedirect } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Auth Helper
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      console.log("Popup blocked, falling back to redirect...");
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    console.error("Auth error:", error);
    throw error;
  }
};

// Connection Test
async function testConnection() {
  try {
    // Attempt to read a non-existent doc to test connectivity
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    console.log("Firebase connected successfully");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase is offline. Check configuration.");
    } else {
      console.warn("Firebase connectivity notice (expected if rules deny):", error);
    }
  }
}

testConnection();
