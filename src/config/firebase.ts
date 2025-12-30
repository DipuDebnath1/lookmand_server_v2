import admin from 'firebase-admin';
import path from 'path';
import { logger } from '../app/logger';

async function initializeFirebase() {
  try {
    // Dynamically import the service account JSON file
    const serviceAccount = await import(
      path.join(__dirname, 'serviceAccountKey.json')
    );

    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    logger.info('Firebase Admin initialized successfully');
  } catch (error) {
    logger.error('Error initializing Firebase Admin:', error);
  }
}

// Call the function to initialize Firebase
initializeFirebase();

export default admin;
