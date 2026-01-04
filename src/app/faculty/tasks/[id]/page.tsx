'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getTask, updateTaskStatus, addTaskComment } from '@/lib/db/tasks';
import { getTaskAuditLogs } from '@/lib/db/audit-logs';
import { Task, AuditLog, TaskStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatDateTime, isOverdue } from '@/lib/utils';

export default function FacultyTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [task, setTask] = useState<Task | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [comment, setComment] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAddingComment, setIsAddingComment] = useState(false);

    useEffect(() => {
        loadTask();
        loadAuditLogs();
    }, [resolvedParams.id]);

    const loadTask = async () => {
        const taskData = await getTask(resolvedParams.id);
        setTask(taskData);
    };

    const loadAuditLogs = async () => {
        const logs = await getTaskAuditLogs(resolvedParams.id);
        setAuditLogs(logs);
    };

    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (!user || !task) return;

        setIsUpdating(true);
        const success = await updateTaskStatus(task.id, newStatus, user.uid);

        if (success) {
            await loadTask();
            await loadAuditLogs();
        } else {
            alert('Failed to update task status');
        }

        setIsUpdating(false);
    };

    const handleAddComment = async () => {
        if (!user || !task || !comment.trim()) return;

        setIsAddingComment(true);
        const success = await addTaskComment(task.id, comment, user.uid, user.name);

        if (success) {
            setComment('');
            await loadTask();
            await loadAuditLogs();
        } else {
            alert('Failed to add comment');
        }

        setIsAddingComment(false);
    };

    if (!task) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-4 text-gray-600">Loading task...</p>
                </div>
            </div>
        );
    }

    const overdue = task.status !== 'Completed' && isOverdue(task.deadline);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    ← Back
                </Button>
            </div>

            <Card className={overdue ? 'border-red-300' : ''}>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle className="text-2xl">{task.title}</CardTitle>
                            <div className="flex gap-2 mt-2">
                                <Badge variant={task.status}>{task.status}</Badge>
                                <Badge variant={task.priority}>{task.priority}</Badge>
                                {overdue && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                        ⚠️ Overdue
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                        <p className="text-gray-600">{task.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-1">Deadline</h4>
                            <p className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                {formatDate(task.deadline)}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-1">Created By</h4>
                            <p className="text-gray-600">{task.createdByName}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-1">Created At</h4>
                            <p className="text-gray-600">{formatDateTime(task.createdAt)}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-1">Last Updated</h4>
                            <p className="text-gray-600">{formatDateTime(task.updatedAt)}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Update Status</h4>
                        <div className="flex gap-2">
                            <Button
                                variant={task.status === 'Pending' ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange('Pending')}
                                disabled={isUpdating || task.status === 'Pending'}
                            >
                                Pending
                            </Button>
                            <Button
                                variant={task.status === 'In Progress' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange('In Progress')}
                                disabled={isUpdating || task.status === 'In Progress'}
                            >
                                In Progress
                            </Button>
                            <Button
                                variant={task.status === 'Completed' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange('Completed')}
                                disabled={isUpdating || task.status === 'Completed'}
                            >
                                Completed
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Progress Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {task.comments && task.comments.length > 0 ? (
                            task.comments.map((c) => (
                                <div key={c.id} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-gray-900">{c.authorName}</span>
                                        <span className="text-xs text-gray-500">{formatDateTime(c.createdAt)}</span>
                                    </div>
                                    <p className="text-gray-700">{c.text}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">No comments yet</p>
                        )}
                    </div>

                    <div className="border-t pt-4">
                        <Textarea
                            label="Add a Comment"
                            placeholder="Share your progress or updates..."
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={isAddingComment}
                        />
                        <Button
                            variant="primary"
                            className="mt-2"
                            onClick={handleAddComment}
                            disabled={!comment.trim() || isAddingComment}
                            isLoading={isAddingComment}
                        >
                            Add Comment
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Task History</CardTitle>
                </CardHeader>
                <CardContent>
                    {auditLogs.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No history yet</p>
                    ) : (
                        <div className="space-y-2">
                            {auditLogs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3 text-sm">
                                    <span className="text-gray-400">{formatDateTime(log.timestamp)}</span>
                                    <div className="flex-1">
                                        <span className="font-medium">{log.performedByName}</span>
                                        <span className="text-gray-600"> {log.details}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
