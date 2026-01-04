import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { AuditLog, AuditAction } from '@/types';
import { getUser } from './users';
import { getTask } from './tasks';

interface CreateAuditLogData {
    taskId: string;
    action: AuditAction;
    performedBy: string;
    details?: string;
    previousValue?: string;
    newValue?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: CreateAuditLogData): Promise<void> {
    try {
        const auditLogsRef = collection(db, 'auditLogs');

        await addDoc(auditLogsRef, {
            taskId: data.taskId,
            action: data.action,
            performedBy: data.performedBy,
            timestamp: Timestamp.now(),
            details: data.details || '',
            previousValue: data.previousValue || '',
            newValue: data.newValue || '',
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
    }
}

/**
 * Get audit logs for a specific task
 */
export async function getTaskAuditLogs(taskId: string): Promise<AuditLog[]> {
    try {
        const auditLogsRef = collection(db, 'auditLogs');
        const q = query(
            auditLogsRef,
            where('taskId', '==', taskId),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);

        const logs = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
                const logData = { ...doc.data(), id: doc.id } as AuditLog;

                // Populate user name
                const user = await getUser(logData.performedBy);
                if (user) logData.performedByName = user.name;

                // Populate task title
                const task = await getTask(logData.taskId);
                if (task) logData.taskTitle = task.title;

                return logData;
            })
        );

        return logs;
    } catch (error) {
        console.error('Error getting task audit logs:', error);
        return [];
    }
}

/**
 * Get all audit logs (for admin)
 */
export async function getAllAuditLogs(limitCount: number = 100): Promise<AuditLog[]> {
    try {
        const auditLogsRef = collection(db, 'auditLogs');
        const q = query(
            auditLogsRef,
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);

        const logs = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
                const logData = { ...doc.data(), id: doc.id } as AuditLog;

                // Populate user name
                const user = await getUser(logData.performedBy);
                if (user) logData.performedByName = user.name;

                // Populate task title
                const task = await getTask(logData.taskId);
                if (task) logData.taskTitle = task.title;

                return logData;
            })
        );

        return logs;
    } catch (error) {
        console.error('Error getting all audit logs:', error);
        return [];
    }
}

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(count: number = 10): Promise<AuditLog[]> {
    return getAllAuditLogs(count);
}
