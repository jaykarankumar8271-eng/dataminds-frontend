import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigJSON from '../firebase-applet-config.json';

// Use environment variables if available (for Vercel), otherwise fallback to JSON (for AI Studio)
const config = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJSON.apiKey || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJSON.authDomain || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJSON.projectId || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJSON.appId || '').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJSON.storageBucket || '').trim(),
};

const databaseId = (import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJSON.firestoreDatabaseId || '(default)').trim();

console.log('Firebase Config:', {
  projectId: config.projectId,
  databaseId: databaseId,
  authDomain: config.authDomain
});

const app = initializeApp(config);
export const db = getFirestore(app, databaseId);
export const auth = getAuth();
