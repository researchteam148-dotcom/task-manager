import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    Timestamp,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { LeaveRequest, LeaveStatus } from '@/types';
import { createNotification } from './notifications';
import { getUser } from './users';

/**
 * Faculty submits a leave request via API
 */
export async function requestLeave(
    facultyUid: string,
    facultyName: string,
    startDate: string,
    endDate: string,
    reason: string
): Promise<string | null> {
    try {
        const { auth } = await import('../firebase-config');
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No authenticated user');

        const idToken = await currentUser.getIdToken();

        const response = await fetch('/api/faculty/request-leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                facultyUid,
                facultyName,
                startDate,
                endDate,
                reason,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit leave request');
        }

        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Error requesting leave:', error);
        return null;
    }
}

/**
 * Subscribe to all pending leave requests (for admins)
 */
export function subscribeToPendingLeaves(
    callback: (leaves: LeaveRequest[]) => void,
    errorCallback?: (error: Error) => void
): Unsubscribe {
    const q = query(
        collection(db, 'leaves'),
        where('status', '==', 'pending')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const leaves = snapshot.docs.map(
                (doc) => ({ ...doc.data(), id: doc.id } as LeaveRequest)
            );
            callback(leaves);
        },
        (error) => {
            console.error('Error in subscribeToPendingLeaves:', error);
            if (error.message.includes('requires an index')) {
                console.error('🔥 FIRESTORE INDEX MISSING: Pending leaves query requires an index.');
            }
            if (errorCallback) errorCallback(error);
        }
    );
}

/**
 * Subscribe to all processed leave requests (for admins)
 */
export function subscribeToProcessedLeaves(
    callback: (leaves: LeaveRequest[]) => void,
    errorCallback?: (error: Error) => void
): Unsubscribe {
    const q = query(
        collection(db, 'leaves'),
        where('status', '!=', 'pending'),
        orderBy('status'),
        orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const leaves = snapshot.docs.map(
                (doc) => ({ ...doc.data(), id: doc.id } as LeaveRequest)
            );
            callback(leaves);
        },
        (error) => {
            console.error('Error in subscribeToProcessedLeaves:', error);
            if (error.message.includes('requires an index')) {
                // Constructing the likely index URL (this is a guess based on the pattern, but helps the user find the blue link in console)
                console.error('🔥 FIRESTORE INDEX MISSING: Admin processed leaves query requires a composite index.');
                console.error('Please check your browser console for the direct creation link.');
            }
            if (errorCallback) errorCallback(error);
        }
    );
}

/**
 * Faculty fetches their own leave history
 */
export function subscribeToFacultyLeaves(
    facultyUid: string,
    callback: (leaves: LeaveRequest[]) => void,
    errorCallback?: (error: Error) => void
): Unsubscribe {
    const q = query(
        collection(db, 'leaves'),
        where('facultyUid', '==', facultyUid),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const leaves = snapshot.docs.map(
                (doc) => ({ ...doc.data(), id: doc.id } as LeaveRequest)
            );
            callback(leaves);
        },
        (error) => {
            console.error('Error in subscribeToFacultyLeaves:', error);
            if (error.message.includes('requires an index')) {
                console.error('🔥 FIRESTORE INDEX MISSING: Faculty leave history requires a composite index.');
                console.error('Please check your browser console for the direct creation link.');
            }
            if (errorCallback) errorCallback(error);
        }
    );
}

/**
 * Admin updates leave request status (approve/reject)
 */
export async function updateLeaveStatus(
    leaveId: string,
    status: LeaveStatus,
    adminId: string,
    adminComment: string
): Promise<boolean> {
    try {
        const leaveRef = doc(db, 'leaves', leaveId);

        await updateDoc(leaveRef, {
            status,
            adminId,
            adminComment,
            updatedAt: Timestamp.now(),
        });

        // Fetch leave data to notify faculty
        const leaveSnap = await getDocs(query(collection(db, 'leaves'), where('__name__', '==', leaveId)));
        if (!leaveSnap.empty) {
            const leaveData = leaveSnap.docs[0].data() as LeaveRequest;

            await createNotification(
                leaveData.facultyUid,
                'leave_status',
                `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                `Your leave request has been ${status}${adminComment ? ': ' + adminComment : '.'}`,
                leaveId
            );
        }

        return true;
    } catch (error) {
        console.error('Error updating leave status:', error);
        return false;
    }
}
