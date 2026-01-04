import {
    collection,
    doc,
    getDoc,
    setDoc,
    query,
    where,
    getDocs,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { FacultySchedule, ScheduleSlot } from '@/types';

/**
 * Get the weekly schedule for a faculty member
 */
export async function getFacultySchedule(facultyUid: string): Promise<FacultySchedule | null> {
    try {
        const scheduleRef = doc(db, 'schedules', facultyUid);
        const scheduleDoc = await getDoc(scheduleRef);

        if (!scheduleDoc.exists()) {
            return null;
        }

        return scheduleDoc.data() as FacultySchedule;
    } catch (error) {
        console.error('Error getting faculty schedule:', error);
        return null;
    }
}

/**
 * Update the weekly schedule for a faculty member
 */
export async function updateFacultySchedule(
    facultyUid: string,
    slots: ScheduleSlot[]
): Promise<boolean> {
    try {
        const scheduleRef = doc(db, 'schedules', facultyUid);

        const scheduleData: FacultySchedule = {
            facultyUid,
            slots,
            updatedAt: Timestamp.now(),
        };

        await setDoc(scheduleRef, scheduleData);
        return true;
    } catch (error) {
        console.error('Error updating faculty schedule:', error);
        return false;
    }
}

/**
 * Find all faculty members who have a leisure period on a specific day and time slot
 */
export async function findAvailableFaculty(
    day: ScheduleSlot['day'],
    startTime: string,
    department?: string
): Promise<{ uid: string; name: string }[]> {
    try {
        const schedulesRef = collection(db, 'schedules');
        const q = department
            ? query(collection(db, 'users'), where('role', '==', 'faculty'), where('department', '==', department))
            : query(collection(db, 'users'), where('role', '==', 'faculty'));

        const facultySnap = await getDocs(q);
        const availableFaculty: { uid: string; name: string }[] = [];

        for (const facultyDoc of facultySnap.docs) {
            const facultyData = facultyDoc.data();
            const schedule = await getFacultySchedule(facultyDoc.id);

            if (schedule) {
                // Check if this faculty has a leisure slot that matches the time
                const isLeisure = schedule.slots.some(
                    slot => slot.day === day &&
                        slot.startTime === startTime &&
                        slot.type === 'leisure'
                );

                if (isLeisure) {
                    availableFaculty.push({
                        uid: facultyDoc.id,
                        name: facultyData.name
                    });
                }
            }
        }

        return availableFaculty;
    } catch (error) {
        console.error('Error finding available faculty:', error);
        return [];
    }
}
