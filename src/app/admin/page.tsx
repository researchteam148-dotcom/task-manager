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
        {
            label: 'Total Tasks',
            value: stats.total,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            label: 'Pending',
            value: stats.pending,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'In Progress',
            value: stats.inProgress,
            color: 'text-primary-600',
            bgColor: 'bg-primary-50',
            borderColor: 'border-primary-200',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            label: 'Completed',
            value: stats.completed,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'High Priority',
            value: stats.highPriority,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-200',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        {
            label: 'Overdue',
            value: stats.overdue,
            color: 'text-red-700',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 font-medium">Welcome back, {user?.name}</p>
                </div>
                <Link href="/admin/tasks/create" className="w-full xs:w-auto">
                    <Button variant="primary" className="w-full shadow-lg shadow-primary-200 rounded-xl px-6 h-12 font-bold transition-all hover:-translate-y-0.5 active:translate-y-0">
                        <span className="mr-2">➕</span> Create Task
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${stat.bgColor.replace('bg-', 'bg-')}`}></div>
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} ${stat.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    {stat.icon}
                                </div>
                                <div className="text-right sm:text-right">
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                                        {stat.label}
                                    </p>
                                    <p className={`text-xl sm:text-2xl font-black ${stat.color} leading-none`}>
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-black text-gray-800">Recent Tasks</CardTitle>
                        <Link href="/admin/tasks" className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">
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
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-black text-gray-800">Faculty Members</CardTitle>
                        <Link href="/admin/faculty" className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">
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
