import { adminDb } from './src/lib/firebase-admin.ts';

export async function initAccountingDb() {
  console.log("Firestore initialized for Accounting DB");
  return adminDb;
}

export function getAccountingDb() {
  return adminDb;
}
