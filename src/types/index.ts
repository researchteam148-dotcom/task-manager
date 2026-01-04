import { Timestamp } from 'firebase/firestore';

// User types
export type UserRole = 'admin' | 'faculty';

export interface User {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    empId: string;
    photoURL?: string;
    bio?: string;
    requiresPasswordChange?: boolean;
    createdAt: Timestamp;
}

// Task types
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    deadline: Timestamp;
    assignedTo: string; // faculty uid
    assignedToName?: string; // populated for display
    createdBy: string; // admin uid
    createdByName?: string; // populated for display
    createdAt: Timestamp;
    updatedAt: Timestamp;
    comments?: TaskComment[];
}

export interface TaskComment {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    createdAt: Timestamp;
}

// Audit log types
export type AuditAction = 'Created' | 'Updated' | 'Completed' | 'Deleted' | 'Status Changed' | 'Comment Added';

export interface AuditLog {
    id: string;
    taskId: string;
    taskTitle?: string; // populated for display
    action: AuditAction;
    performedBy: string; // uid
    performedByName?: string; // populated for display
    timestamp: Timestamp;
    details?: string; // additional information about the change
    previousValue?: string;
    newValue?: string;
}

// Form input types (before Timestamp conversion)
export interface TaskFormData {
    title: string;
    description: string;
    priority: TaskPriority;
    deadline: string; // ISO date string
    assignedTo: string;
}

export interface TaskUpdateData {
    status?: TaskStatus;
    title?: string;
    description?: string;
    priority?: TaskPriority;
    deadline?: string;
    assignedTo?: string;
}

// Schedule and Time Table types
export type SlotType = 'class' | 'leisure';

export interface ScheduleSlot {
    id: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    type: SlotType;
    subject?: string;
    location?: string;
}

export interface FacultySchedule {
    facultyUid: string;
    slots: ScheduleSlot[];
    updatedAt: Timestamp;
}

export interface AbsenceRecord {
    id: string;
    facultyUid: string;
    facultyName: string;
    date: Timestamp;
    startTime: string;
    endTime: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    substitutionId?: string;
    createdAt: Timestamp;
}

export interface Substitution {
    id: string;
    absenceId: string;
    originalFacultyId: string;
    substituteFacultyId: string;
    substituteName: string;
    date: Timestamp;
    startTime: string;
    endTime: string;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: Timestamp;
}

// Leave types
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
    id: string;
    facultyUid: string;
    facultyName: string;
    startDate: Timestamp;
    endDate: Timestamp;
    reason: string;
    status: LeaveStatus;
    adminId?: string;
    adminComment?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Notification types
export type NotificationType = 'leave_request' | 'leave_status' | 'task_status' | 'comment_added' | 'system';

export interface Notification {
    id: string;
    userId: string; // recipient
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    relatedId?: string; // e.g. taskId or leaveId
    createdAt: Timestamp;
}

// Filter and search types
export interface TaskFilters {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    searchQuery?: string;
    startDate?: string;
    endDate?: string;
}

// Dashboard stats types
export interface DashboardStats {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    highPriority: number;
    overdue: number;
    activeSubstitutions?: number; // New stat
}
