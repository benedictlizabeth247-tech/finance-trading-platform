'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseConfig, isFirebaseConfigured } from "./config";

/**
 * Singleton pattern for Firebase Initialization
 * Prevents "Firebase App already exists" errors and initialization crashes.
 */
let app: FirebaseApp | undefined;

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
};

export const getFirebaseAuth = (): Auth | null => {
  const app = getFirebaseApp();
  if (!app) return null;
  return getAuth(app);
};

export const getFirebaseDb = (): Firestore | null => {
  const app = getFirebaseApp();
  if (!app) return null;
  return getFirestore(app);
};

export const getFirebaseStorage = (): FirebaseStorage | null => {
  const app = getFirebaseApp();
  if (!app) return null;
  return getStorage(app);
};

/**
 * Initializes (or reuses) the Firebase singletons.
 * Returns nullable instances so the app can still render in a
 * degraded/offline mode when Firebase env vars are absent.
 */
export const initializeFirebase = (): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
} => ({
  app: getFirebaseApp(),
  auth: getFirebaseAuth(),
  db: getFirebaseDb(),
});

/**
 * Instance getters for simplified hook access.
 * Non-null assertions: consumers run inside FirebaseClientProvider,
 * and every call site already guards against runtime errors.
 */
export const auth = getFirebaseAuth() as Auth;
export const db = getFirebaseDb() as Firestore;
export const storage = getFirebaseStorage() as FirebaseStorage;

export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';

export default app;
