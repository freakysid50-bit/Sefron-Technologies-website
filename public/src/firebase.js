import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Retrieves the Firebase configuration from environment variables.
 * Works seamlessly across Vite (import.meta.env), Node.js (process.env),
 * runtime window globals, and the /api/firebase-config endpoint.
 */
export async function getFirebaseConfig() {
  // 1. Vite build environment
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
    };
  }

  // 2. Pre-injected window globals
  if (typeof window !== "undefined" && window.__FIREBASE_CONFIG__ && window.__FIREBASE_CONFIG__.projectId) {
    return window.__FIREBASE_CONFIG__;
  }

  // 3. Node.js process environment
  if (typeof process !== "undefined" && process.env && process.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY || "",
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.VITE_FIREBASE_APP_ID || ""
    };
  }

  // 4. Fetch from server endpoint (Express static runtime)
  if (typeof window !== "undefined" && typeof fetch === "function") {
    try {
      const response = await fetch("/api/firebase-config");
      if (response.ok) {
        const text = await response.text();
        try {
          const config = JSON.parse(text);
          if (config && config.projectId) {
            window.__FIREBASE_CONFIG__ = config;
            return config;
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn("Could not retrieve Firebase configuration from /api/firebase-config:", err);
    }

    try {
      const response = await fetch("/firebase-config.json");
      if (response.ok) {
        const config = await response.json();
        if (config && config.projectId) {
          window.__FIREBASE_CONFIG__ = config;
          return config;
        }
      }
    } catch (_) {}
  }

  return {
    apiKey: "AIzaSyBVEIVVWsvy0tV3W221zRfILZ1uXRi8lTE",
    authDomain: "sefron-technologies.firebaseapp.com",
    projectId: "sefron-technologies",
    storageBucket: "sefron-technologies.firebasestorage.app",
    messagingSenderId: "742482725746",
    appId: "1:742482725746:web:ceafabe692c092df23abeb"
  };
}

let app = null;
let db = null;

/**
 * Initializes Firebase App and returns the Firestore instance.
 * Throws a descriptive error if environment configuration is missing.
 */
export async function initFirestore() {
  if (db) return { app, db };

  const config = await getFirebaseConfig();

  if (!config.apiKey || !config.projectId) {
    throw new Error(
      "Firebase configuration missing. Please populate VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your .env file."
    );
  }

  app = getApps().length > 0 ? getApp() : initializeApp(config);
  db = getFirestore(app);

  return { app, db };
}

// Synchronous default initialization if static environment variables are already populated
const staticConfig = {
  apiKey: typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_API_KEY ? import.meta.env.VITE_FIREBASE_API_KEY : (typeof process !== "undefined" && process.env?.VITE_FIREBASE_API_KEY ? process.env.VITE_FIREBASE_API_KEY : "AIzaSyBVEIVVWsvy0tV3W221zRfILZ1uXRi8lTE"),
  authDomain: typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : (typeof process !== "undefined" && process.env?.VITE_FIREBASE_AUTH_DOMAIN ? process.env.VITE_FIREBASE_AUTH_DOMAIN : "sefron-technologies.firebaseapp.com"),
  projectId: typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_PROJECT_ID ? import.meta.env.VITE_FIREBASE_PROJECT_ID : (typeof process !== "undefined" && process.env?.VITE_FIREBASE_PROJECT_ID ? process.env.VITE_FIREBASE_PROJECT_ID : "sefron-technologies"),
  storageBucket: typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : (typeof process !== "undefined" && process.env?.VITE_FIREBASE_STORAGE_BUCKET ? process.env.VITE_FIREBASE_STORAGE_BUCKET : "sefron-technologies.firebasestorage.app"),
  messagingSenderId: typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : (typeof process !== "undefined" && process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ? process.env.VITE_FIREBASE_MESSAGING_SENDER_ID : "742482725746"),
  appId: typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_APP_ID ? import.meta.env.VITE_FIREBASE_APP_ID : (typeof process !== "undefined" && process.env?.VITE_FIREBASE_APP_ID ? process.env.VITE_FIREBASE_APP_ID : "1:742482725746:web:ceafabe692c092df23abeb")
};

if (staticConfig.projectId && staticConfig.apiKey) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(staticConfig);
    db = getFirestore(app);
  } catch (initErr) {
    console.warn("Initial synchronous Firebase initialization skipped:", initErr);
  }
}

export { app, db, collection, addDoc, serverTimestamp };
export default db;
