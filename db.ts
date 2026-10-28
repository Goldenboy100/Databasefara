import { adminDb } from './src/lib/firebase-admin.ts';

export async function initDb() {
  console.log("Firestore initialized as primary database");
  return adminDb;
}

export function getDb() {
  return adminDb;
}

// Migration utilities or helper functions can be added here if needed
// but for Firestore we use the admin SDK directly in the server routes.
