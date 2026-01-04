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
 * Includes AI-inspired "smart scoring" to find the best possible substitute
 */
export async function findAvailableFaculty(
    date: Date,
    startTime: string,
    targetDepartment?: string
): Promise<{ uid: string; name: string; score: number }[]> {
    try {
        // 1. Convert Date to Weekday
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[date.getDay()] as ScheduleSlot['day'];

        // 2. Fetch all faculty
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'faculty'));
        const facultySnap = await getDocs(q);

        const availabilityList: { uid: string; name: string; score: number }[] = [];

        for (const facultyDoc of facultySnap.docs) {
            const facultyData = facultyDoc.data();
            const schedule = await getFacultySchedule(facultyDoc.id);

            if (schedule) {
                // Check if this faculty has a leisure slot that matches the time on that specific weekday
                const isLeisure = schedule.slots.some(
                    slot => slot.day === dayName &&
                        slot.startTime === startTime &&
                        slot.type === 'leisure'
                );

                if (isLeisure) {
                    // 3. APPLY SMART SCORING LOGIC
                    let score = 0;

                    // Preference 1: Same Department (+50 points)
                    if (targetDepartment && facultyData.department === targetDepartment) {
                        score += 50;
                    }

                    // Preference 2: Workload Balancing
                    // Check how many active substitutions they already have for this date (lower is better)
                    const subsRef = collection(db, 'substitutions');
                    const subQ = query(
                        subsRef,
                        where('substituteFacultyId', '==', facultyDoc.id),
                        where('status', '==', 'active')
                    );
                    const subSnap = await getDocs(subQ);

                    // Deduct points for each active substitution to balance load
                    score -= (subSnap.docs.length * 15);

                    // Preference 3: Schedule Proximity
                    // (Potential future enhancement: check if they have a class before/after this slot)

                    availabilityList.push({
                        uid: facultyDoc.id,
                        name: facultyData.name,
                        score: score
                    });
                }
            }
        }

        // Sort by score descending (highest score first)
        return availabilityList.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Error finding available faculty:', error);
        return [];
    }
}
