/**
 * @fileOverview Official Firebase configuration for nexMonie project.
 * Uses environment variables for security and portability.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Logic to check if the configuration is complete
export const isFirebaseConfigured = !!(
  config.apiKey && 
  config.apiKey !== 'undefined' &&
  config.projectId &&
  config.projectId !== 'undefined'
);

export const firebaseConfig = config;
