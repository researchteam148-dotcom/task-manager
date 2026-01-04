import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { User, UserRole } from '@/types';

/**
 * Create a new user profile in Firestore
 */
export async function createUser(userData: Omit<User, 'createdAt'>): Promise<void> {
    try {
        const userRef = doc(db, 'users', userData.uid);
        await setDoc(userRef, {
            ...userData,
            createdAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user profile');
    }
}

/**
 * Get user by UID
 */
export async function getUser(uid: string): Promise<User | null> {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
            return null;
        }

        return { ...userDoc.data(), uid: userDoc.id } as User;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

/**
 * Subscribe to user changes
 */
export function subscribeToUser(uid: string, callback: (user: User | null) => void) {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            callback({ ...doc.data(), uid: doc.id } as User);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('Error in user subscription:', error);
        callback(null);
    });
}

/**
 * Update user profile
 */
export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user profile');
    }
}

/**
 * Get all faculty members
 */
export async function getAllFaculty(): Promise<User[]> {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'faculty'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            uid: doc.id,
        })) as User[];
    } catch (error) {
        console.error('Error getting faculty:', error);
        return [];
    }
}

/**
 * Get users by department
 */
export async function getUsersByDepartment(department: string): Promise<User[]> {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('department', '==', department));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            uid: doc.id,
        })) as User[];
    } catch (error) {
        console.error('Error getting users by department:', error);
        return [];
    }
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
    try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            uid: doc.id,
        })) as User[];
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
}
