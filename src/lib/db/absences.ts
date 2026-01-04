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
        // 1. Identify day of the week
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[date.getDay()] as ScheduleSlot['day'];

        // 2. Find available faculty in the same department
        const substitutes = await findAvailableFaculty(dayName, startTime, user.department);

        // 3. Auto-assign if someone is available
        let substitutionId: string | undefined;
        if (substitutes.length > 0) {
            const chosenStaff = substitutes[0]; // Simple logic: pick first available

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

            // Create audit log
            await createAuditLog({
                taskId: 'SUBSTITUTION',
                action: 'Updated',
                performedBy: 'SYSTEM',
                details: `Auto-assigned ${chosenStaff.name} to substitute ${user.name} on ${date.toDateString()} at ${startTime}`,
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
