'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { subscribeToUserTasks } from '@/lib/db/tasks';
import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDate, isOverdue } from '@/lib/utils';

export default function FacultyTasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');

    useEffect(() => {
        if (!user) {
            console.log('FacultyTasksPage: No user found in context');
            return;
        }

        console.log('FacultyTasksPage: Logged in as:', user.uid, user.email);

        const unsubscribe = subscribeToUserTasks(user.uid, (updatedTasks) => {
            console.log('FacultyTasksPage: Received tasks count:', updatedTasks.length);
            setTasks(updatedTasks);
            setFilteredTasks(updatedTasks);
        });

        return () => {
            console.log('FacultyTasksPage: Unsubscribing');
            unsubscribe();
        };
    }, [user]);

    useEffect(() => {
        let filtered = [...tasks];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter(task => task.status === statusFilter);
        }

        // Priority filter
        if (priorityFilter !== 'All') {
            filtered = filtered.filter(task => task.priority === priorityFilter);
        }

        setFilteredTasks(filtered);
    }, [searchQuery, statusFilter, priorityFilter, tasks]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">My Tasks</h1>
                <p className="text-sm text-gray-500 mt-1">View and manage your assigned tasks</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="flex-1 w-full">
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:flex gap-2">
                            <select
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>

                            <select
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <option value="All">All Priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredTasks.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            {tasks.length === 0 ? 'No tasks assigned to you yet.' : 'No tasks match your filters.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filteredTasks.map((task) => {
                                const overdue = task.status !== 'Completed' && isOverdue(task.deadline);

                                return (
                                    <Link key={task.id} href={`/faculty/tasks/${task.id}`}>
                                        <div
                                            className={`p-4 border rounded-xl transition-all hover:shadow-md cursor-pointer ${overdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white hover:border-primary-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <h3 className="font-bold text-gray-900 truncate max-w-[180px] sm:max-w-none">{task.title}</h3>
                                                        <div className="flex gap-1.5 flex-shrink-0">
                                                            <Badge variant={task.status}>{task.status}</Badge>
                                                            <Badge variant={task.priority}>{task.priority}</Badge>
                                                        </div>
                                                        {overdue && (
                                                            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">⚠️ Overdue</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                                                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="text-sm">📅</span>
                                                            Deadline: <strong className="text-gray-900">{formatDate(task.deadline)}</strong>
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="text-sm">👨‍💼</span>
                                                            Created by: <strong className="text-gray-900">{task.createdByName}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-primary-600 text-xl self-center">→</div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Total:</strong> {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                    {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' ? ' (filtered)' : ''}
                </p>
            </div>
        </div>
    );
}
