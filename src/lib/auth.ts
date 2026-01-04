import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    signInWithPopup,
    GoogleAuthProvider,
    User as FirebaseUser,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase-config';
import { User } from '@/types';

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
        console.log('Attempting sign in with:', email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        console.log('Firebase Auth success:', firebaseUser.uid);

        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (!userDoc.exists()) {
            console.error('Firestore user profile not found for UID:', firebaseUser.uid);
            return { user: null, error: 'User profile not found in database' };
        }

        const userData = userDoc.data() as User;
        console.log('Firestore data fetch success:', userData.role);

        return { user: userData, error: null };
    } catch (error: any) {
        console.error('Detailed sign in error:', error);

        let errorMessage = 'Failed to sign in';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid email or password';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid credentials or account does not exist';
        } else if (error.code === 'auth/invalid-api-key') {
            errorMessage = 'Firebase API configuration error. Please check your config.';
        }

        return { user: null, error: `${errorMessage} (${error.code || 'unknown'})` };
    }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<{ user: User | null; error: string | null; isNewUser?: boolean }> {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        // Check if user profile exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (!userDoc.exists()) {
            // New user - create profile with default role as faculty
            // Admin will need to be manually set in Firestore
            const newUserData: User = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                role: 'faculty', // Default role
                department: 'General', // Default department
                empId: 'GOOGLE-' + firebaseUser.uid.slice(0, 5).toUpperCase(),
                createdAt: Timestamp.now(),
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);

            return { user: newUserData, error: null, isNewUser: true };
        }

        const userData = userDoc.data() as User;
        return { user: userData, error: null, isNewUser: false };
    } catch (error: any) {
        console.error('Google sign in error:', error);

        let errorMessage = 'Failed to sign in with Google';
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign in cancelled';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup blocked. Please allow popups for this site';
        }

        return { user: null, error: errorMessage };
    }
}

/**
 * Get current user data from Firestore
 */
export async function getCurrentUser(uid: string): Promise<User | null> {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
            return null;
        }

        return userDoc.data() as User;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}
