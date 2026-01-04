'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { subscribeToAllTasks } from '@/lib/db/tasks';
import { getAllFaculty } from '@/lib/db/users';
import { Task, DashboardStats, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isOverdue } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [faculty, setFaculty] = useState<User[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        highPriority: 0,
        overdue: 0,
    });

    useEffect(() => {
        // Subscribe to tasks
        const unsubscribeTasks = subscribeToAllTasks((updatedTasks) => {
            setTasks(updatedTasks);

            const newStats: DashboardStats = {
                total: updatedTasks.length,
                pending: updatedTasks.filter(t => t.status === 'Pending').length,
                inProgress: updatedTasks.filter(t => t.status === 'In Progress').length,
                completed: updatedTasks.filter(t => t.status === 'Completed').length,
                highPriority: updatedTasks.filter(t => t.priority === 'High').length,
                overdue: updatedTasks.filter(t =>
                    t.status !== 'Completed' && isOverdue(t.deadline)
                ).length,
            };
            setStats(newStats);
        });

        // Load faculty
        const loadFaculty = async () => {
            const facultyData = await getAllFaculty();
            setFaculty(facultyData);
        };
        loadFaculty();

        return () => {
            unsubscribeTasks();
        };
    }, []);

    const statCards = [
        { label: 'Total Tasks', value: stats.total, color: 'text-blue-600', bgColor: 'bg-blue-50', emoji: '📊' },
        { label: 'Pending', value: stats.pending, color: 'text-yellow-600', bgColor: 'bg-yellow-50', emoji: '⏳' },
        { label: 'In Progress', value: stats.inProgress, color: 'text-primary-600', bgColor: 'bg-primary-50', emoji: '🚀' },
        { label: 'Completed', value: stats.completed, color: 'text-green-600', bgColor: 'bg-green-50', emoji: '✅' },
        { label: 'High Priority', value: stats.highPriority, color: 'text-red-600', bgColor: 'bg-red-50', emoji: '🔥' },
        { label: 'Overdue', value: stats.overdue, color: 'text-red-600', bgColor: 'bg-red-50', emoji: '⚠️' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
                </div>
                <Link href="/admin/tasks/create">
                    <Button variant="primary">➕ Create New Task</Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                                    <span className="text-xl">{stat.emoji}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Tasks</CardTitle>
                        <Link href="/admin/tasks" className="text-sm text-primary-600 hover:underline">
                            View All
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {tasks.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No tasks yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {tasks.slice(0, 5).map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Assigned: {task.assignedToName}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={task.status}>{task.status}</Badge>
                                            <Badge variant={task.priority}>{task.priority}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Faculty List */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Faculty Members</CardTitle>
                        <Link href="/admin/faculty" className="text-sm text-primary-600 hover:underline">
                            Manage
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {faculty.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No faculty found.</p>
                        ) : (
                            <div className="space-y-3">
                                {faculty.slice(0, 6).map((f) => (
                                    <div
                                        key={f.uid}
                                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                                    >
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-gray-900 text-sm truncate">{f.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{f.department}</p>
                                        </div>
                                        <Link href={`/admin/tasks/create?assignTo=${f.uid}`}>
                                            <Button variant="ghost" size="sm" className="text-xs h-8">
                                                Assign
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                                {faculty.length > 6 && (
                                    <Link href="/admin/faculty">
                                        <Button variant="outline" className="w-full text-xs mt-2">
                                            View All {faculty.length} Faculty
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>System Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link
                            href="/admin/tasks/create"
                            className="flex items-center gap-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all group"
                        >
                            <span className="text-2xl">📝</span>
                            <span className="font-semibold text-primary-700">New Task</span>
                        </Link>
                        <Link
                            href="/admin/faculty"
                            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
                        >
                            <span className="text-2xl">👥</span>
                            <span className="font-semibold text-blue-700">Manage Staff</span>
                        </Link>
                        <Link
                            href="/admin/audit-logs"
                            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all group"
                        >
                            <span className="text-2xl">📜</span>
                            <span className="font-semibold text-purple-700">Audit Logs</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
