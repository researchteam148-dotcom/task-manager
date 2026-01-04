import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { AbsenceRecord, Substitution, ScheduleSlot } from '@/types';
import { findAvailableFaculty } from './schedules';
import { getUser } from './users';
import { createAuditLog } from './audit-logs';

/**
 * Report a faculty absence and trigger smart auto-assignment
 */
export async function reportAbsence(
    facultyUid: string,
    date: Date,
    startTime: string,
    endTime: string,
    reason?: string
): Promise<{ absenceId: string; substitutionId?: string } | null> {
    try {
        const user = await getUser(facultyUid);
        if (!user) throw new Error('User not found');

        const absenceData: Omit<AbsenceRecord, 'id'> = {
            facultyUid,
            facultyName: user.name,
            date: Timestamp.fromDate(date),
            startTime,
            endTime,
            reason,
            status: 'pending',
            createdAt: Timestamp.now(),
        };

        const absenceRef = await addDoc(collection(db, 'absences'), absenceData);

        // Smart Auto-assignment Logic
        // 1. Find the BEST available faculty using Smart Scoring
        // This now handles Date -> Weekday conversion internally in schedules.ts
        const substitutes = await findAvailableFaculty(date, startTime, user.department);

        // 2. Auto-assign the highest scoring faculty member
        let substitutionId: string | undefined;
        if (substitutes.length > 0) {
            const chosenStaff = substitutes[0]; // The list is already sorted by highest score

            const subData: Omit<Substitution, 'id'> = {
                absenceId: absenceRef.id,
                originalFacultyId: facultyUid,
                substituteFacultyId: chosenStaff.uid,
                substituteName: chosenStaff.name,
                date: Timestamp.fromDate(date),
                startTime,
                endTime,
                status: 'active',
                createdAt: Timestamp.now(),
            };

            const subRef = await addDoc(collection(db, 'substitutions'), subData);
            substitutionId = subRef.id;

            // Update absence record with substitution ID
            await updateDoc(absenceRef, { substitutionId, status: 'approved' });

            // 3. SEND SMART NOTIFICATIONS
            const { createNotification } = await import('./notifications');

            // Notify the substitute
            await createNotification(
                chosenStaff.uid,
                'system',
                '⚡ Intelligent Substitution Assigned',
                `You have been intelligently assigned to substitute for ${user.name} on ${date.toDateString()} at ${startTime}.`,
                subRef.id
            );

            // Notify the original faculty
            await createNotification(
                facultyUid,
                'system',
                '✅ Substitution Arranged',
                `Your absence on ${date.toDateString()} has been covered. ${chosenStaff.name} will be your substitute.`,
                absenceRef.id
            );

            // Create audit log
            await createAuditLog({
                taskId: 'SUBSTITUTION',
                action: 'Updated',
                performedBy: 'INTELLIGENT_SYSTEM',
                details: `Smart-assigned ${chosenStaff.name} (Score: ${chosenStaff.score}) to substitute ${user.name} on ${date.toDateString()} at ${startTime}`,
            });
        }

        return { absenceId: absenceRef.id, substitutionId };
    } catch (error) {
        console.error('Error reporting absence:', error);
        return null;
    }
}

/**
 * Get all active substitutions
 */
export function subscribeToActiveSubstitutions(callback: (subs: Substitution[]) => void): Unsubscribe {
    const q = query(
        collection(db, 'substitutions'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const subs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Substitution));
            callback(subs);
        },
        (error) => {
            console.error('Error in subscribeToActiveSubstitutions:', error);
            if (error.message.includes('requires an index')) {
                console.error('FIREBASE INDEX ERROR: Please create the composite index in Firestore console.');
            }
        }
    );
}

/**
 * Get substitutions for a specific faculty member (as the substitute)
 */
export function subscribeToMySubstitutions(
    facultyUid: string,
    callback: (subs: Substitution[]) => void
): Unsubscribe {
    const q = query(
        collection(db, 'substitutions'),
        where('substituteFacultyId', '==', facultyUid),
        where('status', '==', 'active'),
        orderBy('date', 'asc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const subs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Substitution));
            callback(subs);
        },
        (error) => {
            console.error('Error in subscribeToMySubstitutions:', error);
            if (error.message.includes('requires an index')) {
                console.error('FIREBASE INDEX ERROR: Please create the composite index in Firestore console.');
            }
        }
    );
}
