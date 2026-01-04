'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getTask, updateTask } from '@/lib/db/tasks';
import { getAllFaculty } from '@/lib/db/users';
import { User, TaskPriority, Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [facultyList, setFacultyList] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium' as TaskPriority,
        deadline: '',
        assignedTo: '',
        status: 'Pending',
    });

    useEffect(() => {
        loadData();
    }, [resolvedParams.id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [task, faculty] = await Promise.all([
                getTask(resolvedParams.id),
                getAllFaculty(),
            ]);

            if (task) {
                setFormData({
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    deadline: task.deadline.toDate().toISOString().split('T')[0],
                    assignedTo: task.assignedTo,
                    status: task.status,
                });
                setFacultyList(faculty);
            } else {
                setError('Task not found');
            }
        } catch (err) {
            setError('Failed to load task data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsUpdating(true);

        try {
            if (!user) {
                setError('You must be logged in to update tasks');
                setIsUpdating(false);
                return;
            }

            const success = await updateTask(resolvedParams.id, formData as any, user.uid);

            if (success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/admin/tasks');
                }, 1500);
            } else {
                setError('Failed to update task');
                setIsUpdating(false);
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setIsUpdating(false);
        }
    };

    const priorityOptions = [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
    ];

    const statusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
    ];

    const facultyOptions = facultyList.map(f => ({
        value: f.uid,
        label: `${f.name} (${f.department})`,
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-4 text-gray-600">Loading task details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
                <p className="text-gray-600 mt-1">Update task details and assignment</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Task Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <p className="font-medium">✅ Task updated successfully!</p>
                            <p className="text-sm mt-1">Redirecting to tasks list...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Task Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                disabled={isUpdating}
                            />

                            <Textarea
                                label="Description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                disabled={isUpdating}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Priority"
                                    options={priorityOptions}
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                    required
                                    disabled={isUpdating}
                                />

                                <Select
                                    label="Status"
                                    options={statusOptions}
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    required
                                    disabled={isUpdating}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    required
                                    disabled={isUpdating}
                                />

                                <Select
                                    label="Assign To"
                                    options={facultyOptions}
                                    value={formData.assignedTo}
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                    required
                                    disabled={isUpdating}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    isLoading={isUpdating}
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/admin/tasks')}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
