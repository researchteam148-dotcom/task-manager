'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { createTask } from '@/lib/db/tasks';
import { getAllFaculty } from '@/lib/db/users';
import { User, TaskPriority } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

function CreateTaskForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const assignToId = searchParams.get('assignTo');
    const { user } = useAuth();
    const [facultyList, setFacultyList] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium' as TaskPriority,
        deadline: '',
        assignedTo: '',
    });

    useEffect(() => {
        loadFaculty();
    }, []);

    const loadFaculty = async () => {
        const faculty = await getAllFaculty();
        setFacultyList(faculty);

        // If assignTo parameter exists, use it, otherwise default to first faculty
        if (assignToId) {
            setFormData(prev => ({ ...prev, assignedTo: assignToId }));
        } else if (faculty.length > 0) {
            setFormData(prev => ({ ...prev, assignedTo: faculty[0].uid }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!user) {
                setError('You must be logged in to create tasks');
                setIsLoading(false);
                return;
            }

            if (!formData.title || !formData.description || !formData.deadline || !formData.assignedTo) {
                setError('Please fill in all fields');
                setIsLoading(false);
                return;
            }

            const result = await createTask(formData, user.uid);

            if (result) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/admin/tasks');
                }, 1500);
            } else {
                setError('Failed to create task');
                setIsLoading(false);
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setIsLoading(false);
        }
    };

    const priorityOptions = [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
    ];

    const facultyOptions = facultyList.map(f => ({
        value: f.uid,
        label: `${f.name} (${f.department})`,
    }));

    if (facultyOptions.length === 0) {
        facultyOptions.push({ value: '', label: 'No faculty available' });
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 text-center md:text-left">Create New Task</h1>
                <p className="text-gray-600 mt-1 text-center md:text-left">Assign a new task to faculty members</p>
            </div>

            <Card className="shadow-lg">
                <CardHeader className="bg-primary-50 rounded-t-lg">
                    <CardTitle className="text-primary-900">Task Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {success ? (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <p className="font-bold">✅ Task created successfully!</p>
                            <p className="text-sm mt-1">Redirecting to tasks list...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Task Title"
                                placeholder="Enter task title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                disabled={isLoading}
                            />

                            <Textarea
                                label="Description"
                                placeholder="Enter task description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                disabled={isLoading}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Priority"
                                    options={priorityOptions}
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                    required
                                    disabled={isLoading}
                                />

                                <Input
                                    label="Deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    required
                                    disabled={isLoading}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <Select
                                label="Assign To Faculty"
                                options={facultyOptions}
                                value={formData.assignedTo}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                required
                                disabled={isLoading || facultyList.length === 0}
                            />

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    isLoading={isLoading}
                                >
                                    Create Task
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/admin/tasks')}
                                    disabled={isLoading}
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

export default function CreateTaskPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-12">Loading...</div>}>
            <CreateTaskForm />
        </Suspense>
    );
}
