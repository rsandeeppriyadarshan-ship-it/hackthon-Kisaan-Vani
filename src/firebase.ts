import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App singleton
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Configure Firestore with long-polling auto-detection so iframe/proxy environments never hang on WebChannel streams
try {
  initializeFirestore(
    firebaseApp,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  // Already initialized in current runtime
}

// Initialize Firebase Auth & Firestore (using named database from firebase-applet-config.json)
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);



import { BOOTSTRAPPED_ADMIN_EMAIL } from './config/admin';
export { BOOTSTRAPPED_ADMIN_EMAIL };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const rawMsg = error instanceof Error ? error.message : String(error);
  const isOfflineOrTokenErr =
    rawMsg.includes('client is offline') ||
    rawMsg.includes('Fetching auth token failed') ||
    rawMsg.includes('token-service-api-has-not-been-used');

  const errInfo: FirestoreErrorInfo = {
    error: rawMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  if (isOfflineOrTokenErr) {
    console.warn('Firestore Offline / Auth Token Notice:', rawMsg);
    // Sign out stale auth token if token service is disabled on project
    if (rawMsg.includes('token-service-api-has-not-been-used') && auth.currentUser) {
      firebaseSignOut(auth).catch(() => {});
    }
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Tests connection to Firestore backend
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('permission-denied') || msg.includes('not-found')) {
      // Reached backend successfully (rules denied access as expected for test doc)
      return true;
    }
    console.warn('Firestore connectivity check notice:', msg);
    return false;
  }
}

/**
 * Returns the active Firebase Auth user if signed in with a valid token,
 * or null when token service is unavailable or user operates under Mobile OTP.
 */
export async function ensureFirebaseSession(): Promise<User | null> {
  if (auth.currentUser) {
    try {
      await auth.currentUser.getIdToken(false);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (
        msg.includes('token-service-api-has-not-been-used') ||
        msg.includes('auth/invalid-user-token') ||
        msg.includes('auth/user-token-expired')
      ) {
        console.warn('Firebase Auth token service notice, clearing stale session:', msg);
        await firebaseSignOut(auth).catch(() => {});
        return null;
      }
    }
  }
  return auth.currentUser ?? null;
}

/**
 * Sign in with Google for Admin Portal access
 */
export async function signInAdminWithGoogle(): Promise<{
  user: User | null;
  isAdmin: boolean;
  error?: string;
}> {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;
    const isBootstrappedAdmin =
      Boolean(user.email) &&
      user.email!.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

    if (isBootstrappedAdmin) {
      return { user, isAdmin: true };
    }

    // Check /users/{uid} role in Firestore
    try {
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists() && userSnap.data()?.role === 'admin') {
        return { user, isAdmin: true };
      }
    } catch {}

    return {
      user,
      isAdmin: false,
      error: 'This account is not an authorized admin account.',
    };
  } catch (err: any) {
    return {
      user: null,
      isAdmin: false,
      error: err?.message || 'Google Admin sign-in failed or was cancelled.',
    };
  }
}

// Safely listen to Auth state changes and handle stale/invalid tokens
if (typeof window !== 'undefined') {
  onAuthStateChanged(
    auth,
    (_user) => {
      // Auth state active
    },
    (authErr) => {
      console.warn('Firebase Auth state notice:', authErr);
      if (
        authErr?.message &&
        (authErr.message.includes('token-service-api-has-not-been-used') ||
          authErr.message.includes('auth/invalid-user-token'))
      ) {
        firebaseSignOut(auth).catch(() => {});
      }
    }
  );
}

export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  getDocFromServer,
  onAuthStateChanged,
  firebaseSignOut,
};
