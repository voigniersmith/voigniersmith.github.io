/**
 * Firebase configuration and utilities
 * Initialize Firebase in your Firebase Console and add your config below
 */

// TODO: Replace with your actual Firebase config from Firebase Console
// Get this from: Firebase Console > Project Settings > Web App
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
};

// Initialize Firebase (lazy initialization)
let db: any = null;

/**
 * Get Firebase Realtime Database instance
 * Initializes on first use
 */
export async function getDatabase() {
  if (db) return db;

  try {
    // Dynamic import to keep bundle size small
    const { initializeApp } = await import('firebase/app');
    const { getDatabase: getDb } = await import('firebase/database');

    if (firebaseConfig.projectId) {
      const app = initializeApp(firebaseConfig);
      db = getDb(app);
      return db;
    }
  } catch (error) {
    console.warn('Firebase not configured:', error);
  }

  return null;
}

/**
 * Increment global page load counter
 */
export async function recordPageLoad() {
  try {
    const database = await getDatabase();
    if (!database) return;

    const { ref, increment, update } = await import('firebase/database');

    const timestamp = new Date().toISOString();
    await update(ref(database, 'stats'), {
      totalPageLoads: increment(1),
      lastPageLoad: timestamp,
    });
  } catch (error) {
    console.warn('Error recording page load:', error);
  }
}

/**
 * Record command execution globally
 */
export async function recordGlobalCommand(command: string) {
  try {
    const database = await getDatabase();
    if (!database) return;

    const { ref, increment, update } = await import('firebase/database');

    const cmd = command.split(' ')[0].toLowerCase();

    await update(ref(database, 'stats'), {
      totalCommands: increment(1),
      [`commands/${cmd}`]: increment(1),
      lastCommand: cmd,
      lastCommandTime: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Error recording command:', error);
  }
}

/**
 * Fetch global statistics
 */
export async function fetchGlobalStats() {
  try {
    const database = await getDatabase();
    if (!database) {
      console.log('Firebase database not initialized');
      return null;
    }

    const { ref, get } = await import('firebase/database');

    const snapshot = await get(ref(database, 'stats'));
    console.log('Firebase snapshot exists:', snapshot.exists());
    if (snapshot.exists()) {
      console.log('Global stats:', snapshot.val());
      return snapshot.val();
    }
  } catch (error) {
    console.warn('Error fetching global stats:', error);
  }

  return null;
}

/**
 * Check if Firebase is configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.projectId &&
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain
  );
}
