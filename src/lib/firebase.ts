
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCnsirDq8huPOOkZ-m-axAPdMy2izY59Zc",
  authDomain: "level-up-fitness-f2fq1.firebaseapp.com",
  databaseURL: "https://level-up-fitness-f2fq1-default-rtdb.firebaseio.com",
  projectId: "level-up-fitness-f2fq1",
  storageBucket: "level-up-fitness-f2fq1.firebasestorage.app",
  messagingSenderId: "314387911369",
  appId: "1:314387911369:web:c868d382c0c7378154b318",
  measurementId: "G-Y4NKG5D0NL"
};
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only in the browser and when a measurement ID is provided.
// Analytics may throw in unsupported environments, so wrap in a try/catch.
let analytics: ReturnType<typeof getAnalytics> | undefined = undefined;
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    // Non-fatal: analytics not supported in this environment
    // eslint-disable-next-line no-console
    console.warn("Firebase analytics not initialized:", err);
  }
}

export { app, auth, db, analytics };
