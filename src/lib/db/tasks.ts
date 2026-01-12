import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { Task, TaskStatus, TaskFormData, TaskUpdateData } from '@/types';
import { createAuditLog } from './audit-logs';
import { getUser } from './users';
import { createNotification } from './notifications';

/**
 * Create a new task
 */
export async function createTask(
    taskData: TaskFormData,
    createdBy: string,
    department?: string
): Promise<{ id: string } | null> {
    try {
        const tasksRef = collection(db, 'tasks');

        const task = {
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            status: 'Pending' as TaskStatus,
            deadline: Timestamp.fromDate(new Date(taskData.deadline)),
            assignedTo: taskData.assignedTo,
            createdBy,
            department: department || 'General', // Default to General if not provided
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            comments: [],
        };

        const docRef = await addDoc(tasksRef, task);

        // Create audit log
        await createAuditLog({
            taskId: docRef.id,
            action: 'Created',
            performedBy: createdBy,
            details: `Task created: ${taskData.title}`,
        });

        // Notify assigned faculty
        await createNotification(
            taskData.assignedTo,
            'task_status',
            'New Task Assigned',
            `You have been assigned a new task: ${taskData.title}`,
            docRef.id
        );

        return { id: docRef.id };
    } catch (error) {
        console.error('Error creating task:', error);
        return null;
    }
}

/**
 * Update a task
 */
export async function updateTask(
    taskId: string,
    updates: TaskUpdateData,
    updatedBy: string
): Promise<boolean> {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        const taskDoc = await getDoc(taskRef);

        if (!taskDoc.exists()) {
            throw new Error('Task not found');
        }

        const currentTask = taskDoc.data() as Task;
        const updateData: any = {
            ...updates,
            updatedAt: Timestamp.now(),
        };

        // Convert deadline string to Timestamp if provided
        if (updates.deadline) {
            updateData.deadline = Timestamp.fromDate(new Date(updates.deadline));
        }

        await updateDoc(taskRef, updateData);

        // Create audit log
        let details = 'Task updated';
        if (updates.status) {
            details = `Status changed from ${currentTask.status} to ${updates.status}`;
            await createAuditLog({
                taskId,
                action: 'Status Changed',
                performedBy: updatedBy,
                details,
                previousValue: currentTask.status,
                newValue: updates.status,
            });
        } else {
            await createAuditLog({
                taskId,
                action: 'Updated',
                performedBy: updatedBy,
                details,
            });
        }

        // Notify assigned faculty of update
        await createNotification(
            currentTask.assignedTo,
            'task_status',
            'Task Updated',
            `A task assigned to you has been updated: ${currentTask.title}`,
            taskId
        );

        return true;
    } catch (error) {
        console.error('Error updating task:', error);
        return false;
    }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string, deletedBy: string): Promise<boolean> {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        const taskDoc = await getDoc(taskRef);

        if (!taskDoc.exists()) {
            throw new Error('Task not found');
        }

        const task = taskDoc.data() as Task;

        // Create audit log before deletion
        await createAuditLog({
            taskId,
            action: 'Deleted',
            performedBy: deletedBy,
            details: `Task deleted: ${task.title}`,
        });

        await deleteDoc(taskRef);

        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        return false;
    }
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: string): Promise<Task | null> {
    try {
        const taskDoc = await getDoc(doc(db, 'tasks', taskId));

        if (!taskDoc.exists()) {
            return null;
        }

        const taskData = { ...taskDoc.data(), id: taskDoc.id } as Task;

        // Populate user names
        const assignedUser = await getUser(taskData.assignedTo);
        const creatorUser = await getUser(taskData.createdBy);

        if (assignedUser) taskData.assignedToName = assignedUser.name;
        if (creatorUser) taskData.createdByName = creatorUser.name;

        return taskData;
    } catch (error) {
        console.error('Error getting task:', error);
        return null;
    }
}

/**
 * Subscribe to tasks assigned to a specific user (for faculty)
 */
export function subscribeToUserTasks(
    userId: string,
    callback: (tasks: Task[]) => void
): Unsubscribe {
    const tasksRef = collection(db, 'tasks');
    const q = query(
        tasksRef,
        where('assignedTo', '==', userId),
        orderBy('deadline', 'asc')
    );

    console.log('Subscribing to tasks for user:', userId);
    return onSnapshot(
        q,
        async (snapshot) => {
            console.log(`Found ${snapshot.docs.length} tasks for user: ${userId}`);
            const tasks = await Promise.all(
                snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const taskData = { ...data, id: doc.id } as Task;

                    // Populate user names
                    const assignedUser = await getUser(taskData.assignedTo);
                    const creatorUser = await getUser(taskData.createdBy);

                    if (assignedUser) taskData.assignedToName = assignedUser.name;
                    if (creatorUser) taskData.createdByName = creatorUser.name;

                    return taskData;
                })
            );

            callback(tasks);
        },
        (error) => {
            console.error('Error in subscribeToUserTasks:', error);
            // Alert user about index requirement if that's the error
            if (error.message.includes('requires an index')) {
                console.error('FIREBASE INDEX ERROR: Please create the composite index in Firestore console.');
            }
        }
    );
}

/**
 * Subscribe to all tasks (for admin)
 */
export function subscribeToAllTasks(callback: (tasks: Task[]) => void): Unsubscribe {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    console.log('Subscribing to all tasks');
    return onSnapshot(
        q,
        async (snapshot) => {
            console.log(`Found ${snapshot.docs.length} total tasks`);
            const tasks = await Promise.all(
                snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const taskData = { ...data, id: doc.id } as Task;

                    // Populate user names
                    const assignedUser = await getUser(taskData.assignedTo);
                    const creatorUser = await getUser(taskData.createdBy);

                    if (assignedUser) taskData.assignedToName = assignedUser.name;
                    if (creatorUser) taskData.createdByName = creatorUser.name;

                    return taskData;
                })
            );

            callback(tasks);
        },
        (error) => {
            console.error('Error in subscribeToAllTasks:', error);
        }
    );
}

/**
 * Update task status only
 */
export async function updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    updatedBy: string
): Promise<boolean> {
    return updateTask(taskId, { status }, updatedBy);
}

/**
 * Add a comment to a task
 */
export async function addTaskComment(
    taskId: string,
    comment: string,
    authorId: string,
    authorName: string
): Promise<boolean> {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        const taskDoc = await getDoc(taskRef);

        if (!taskDoc.exists()) {
            throw new Error('Task not found');
        }

        const task = taskDoc.data() as Task;
        const newComment = {
            id: `comment_${Date.now()}`,
            text: comment,
            authorId,
            authorName,
            createdAt: Timestamp.now(),
        };

        const updatedComments = [...(task.comments || []), newComment];

        await updateDoc(taskRef, {
            comments: updatedComments,
            updatedAt: Timestamp.now(),
        });

        // Notify either the faculty or the admin depending on who commented
        const recipientId = authorId === task.assignedTo ? task.createdBy : task.assignedTo;
        const recipientRole = authorId === task.assignedTo ? 'Admin' : 'Faculty';

        await createNotification(
            recipientId,
            'comment_added',
            'New message on task',
            `${authorName} added a comment to: ${task.title}`,
            taskId
        );

        return true;
    } catch (error) {
        console.error('Error adding comment:', error);
        return false;
    }
}

/**
 * Subscribe to department tasks (for HoD)
 */
export function subscribeToDepartmentTasks(
    department: string,
    callback: (tasks: Task[]) => void
): Unsubscribe {
    const tasksRef = collection(db, 'tasks');
    const q = query(
        tasksRef,
        where('department', '==', department),
        orderBy('createdAt', 'desc')
    );

    console.log(`Subscribing to tasks for department: ${department}`);
    return onSnapshot(
        q,
        async (snapshot) => {
            console.log(`Found ${snapshot.docs.length} tasks for department: ${department}`);
            const tasks = await Promise.all(
                snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const taskData = { ...data, id: doc.id } as Task;

                    // Populate user names
                    const assignedUser = await getUser(taskData.assignedTo);
                    const creatorUser = await getUser(taskData.createdBy);

                    if (assignedUser) taskData.assignedToName = assignedUser.name;
                    if (creatorUser) taskData.createdByName = creatorUser.name;

                    return taskData;
                })
            );

            callback(tasks);
        },
        (error) => {
            console.error('Error in subscribeToDepartmentTasks:', error);
            if (error.message.includes('requires an index')) {
                console.error('FIREBASE INDEX ERROR: Missing composite index for department query.');
            }
        }
    );
}
