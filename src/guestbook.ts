// Guestbook entries live in Firebase Realtime Database under guestbook/entries.
// database.rules.json (repo root) is what keeps this safe: append-only, length
// limits, server timestamp. The checks here only give friendlier errors.
import type { Database } from 'firebase/database';

export const NAME_MAX = 32;
export const MESSAGE_MAX = 280;
const COOLDOWN_MS = 60_000;
const COOLDOWN_KEY = 'guestbook:lastSigned';

export interface Entry {
  name: string;
  message: string;
  ts: number;
}

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

let dbPromise: Promise<Database> | null = null;

function db(): Promise<Database> {
  if (!config.projectId) return Promise.reject(new Error('guestbook is offline (no Firebase config)'));
  // Firebase is loaded on first use so the shell itself stays small.
  dbPromise ??= Promise.all([import('firebase/app'), import('firebase/database')]).then(
    ([app, database]) => database.getDatabase(app.initializeApp(config)),
  );
  return dbPromise;
}

// Strip control characters and collapse whitespace.
export function clean(s: string, max: number): string {
  return s
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export async function recent(limit = 20): Promise<Entry[]> {
  const database = await db();
  const { ref, query, orderByChild, limitToLast, get } = await import('firebase/database');
  const snap = await get(query(ref(database, 'guestbook/entries'), orderByChild('ts'), limitToLast(limit)));
  const entries: Entry[] = [];
  snap.forEach((child) => {
    entries.push(child.val() as Entry);
  });
  return entries;
}

export function secondsUntilCanSign(): number {
  try {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    return Math.max(0, Math.ceil((last + COOLDOWN_MS - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

export async function sign(name: string, message: string): Promise<void> {
  const database = await db();
  const { ref, push, serverTimestamp } = await import('firebase/database');
  await push(ref(database, 'guestbook/entries'), { name, message, ts: serverTimestamp() });
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // private mode etc. — the cooldown is a courtesy, not a guarantee
  }
}
