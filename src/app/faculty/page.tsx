'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { subscribeToUserTasks } from '@/lib/db/tasks';
import { getFacultySchedule, updateFacultySchedule } from '@/lib/db/schedules';
import { subscribeToMySubstitutions } from '@/lib/db/absences';
import { subscribeToFacultyLeaves } from '@/lib/db/leaves';
import { Task, DashboardStats, ScheduleSlot, Substitution, LeaveRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, isOverdue } from '@/lib/utils';
import { FacultyRoutine } from '@/components/faculty/faculty-routine';
import { AbsenceReporter } from '@/components/faculty/absence-reporter';

export default function FacultyDashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [mySubstitutions, setMySubstitutions] = useState<Substitution[]>([]);
    const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        highPriority: 0,
        overdue: 0,
    });

    useEffect(() => {
        if (!user) return;

        // Subscribe to tasks
        const unsubscribeTasks = subscribeToUserTasks(user.uid, (updatedTasks) => {
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
                activeSubstitutions: mySubstitutions.length,
            };
            setStats(newStats);
        });

        // Fetch schedule
        const loadSchedule = async () => {
            const data = await getFacultySchedule(user.uid);
            if (data) setSchedule(data.slots);
        };

        // Subscribe to my substitutions
        const unsubscribeSubs = subscribeToMySubstitutions(user.uid, (subs) => {
            setMySubstitutions(subs);
        });

        // Subscribe to recent leaves
        const unsubscribeLeaves = subscribeToFacultyLeaves(user.uid, (leaves) => {
            setRecentLeaves(leaves.slice(0, 3)); // show only top 3 on dashboard
        });

        loadSchedule();
        return () => {
            unsubscribeTasks();
            unsubscribeSubs();
            unsubscribeLeaves();
        };
    }, [user, mySubstitutions.length]);

    const handleSaveSchedule = async (newSlots: ScheduleSlot[]) => {
        if (!user) return;
        setIsSaving(true);
        const success = await updateFacultySchedule(user.uid, newSlots);
        if (success) setSchedule(newSlots);
        setIsSaving(false);
    };

    const statCards = [
        {
            label: 'Total Tasks',
            value: stats.total,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
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
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'Active Subs',
            value: mySubstitutions.length,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            )
        },
        {
            label: 'Completed',
            value: stats.completed,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
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
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Faculty Dashboard</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Manage your routine and tasks</p>
                </div>
                {user && (
                    <Badge variant="purple" className="px-3 py-1 bg-white shadow-sm border-primary-100 text-primary-700 font-bold text-[10px] sm:text-xs">
                        <span className="mr-1">📍</span> {user.department}
                    </Badge>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${stat.bgColor.replace('bg-', 'bg-')}`}></div>
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} ${stat.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    {stat.icon}
                                </div>
                                <div className="text-sm sm:text-right">
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
                {/* Visual Routine - Spans 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center mb-[-16px]">
                        <h2 className="text-xl font-bold text-gray-800">My Daily Routine</h2>
                        <div className="flex gap-2">
                            {isSaving && <span className="text-xs text-gray-400 mt-2">Saving...</span>}
                        </div>
                    </div>
                    <FacultyRoutine
                        slots={schedule}
                        onUpdate={handleSaveSchedule}
                    />

                    {/* Active Substitutions */}
                    {mySubstitutions.length > 0 && (
                        <Card className="border-purple-200 bg-purple-50/30">
                            <CardHeader>
                                <CardTitle className="text-purple-900 flex items-center gap-2">
                                    <span>🔄</span> Active Substitutions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {mySubstitutions.map(sub => (
                                    <div key={sub.id} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-900">{sub.startTime} - {sub.endTime}</p>
                                            <p className="text-sm text-gray-600">Substituting for a colleague</p>
                                        </div>
                                        <Badge className="bg-purple-100 text-purple-700 border-none">Active Today</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Upcoming Deadlines */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-black text-gray-800">Priority Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tasks.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No tasks assigned yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {tasks
                                        .filter(t => t.status !== 'Completed')
                                        .slice(0, 4)
                                        .map((task) => {
                                            const overdue = isOverdue(task.deadline);
                                            return (
                                                <div
                                                    key={task.id}
                                                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${overdue ? 'bg-red-50 border border-red-200' : 'bg-gray-50 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Due: {formatDate(task.deadline)}
                                                            {overdue && <span className="ml-2 text-red-600 font-medium">(Overdue)</span>}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={task.status}>{task.status}</Badge>
                                                        <Badge variant={task.priority}>{task.priority}</Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Absence Reporter */}
                    {user && (
                        <AbsenceReporter
                            facultyUid={user.uid}
                        />
                    )}

                    {/* Quick Links */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Shortcuts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4">
                                <Link
                                    href="/faculty/tasks"
                                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                                    <span className="font-semibold text-blue-700">View My Tasks</span>
                                </Link>
                                <Link
                                    href="/faculty/leaves"
                                    className="flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors group"
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
                                    <span className="font-semibold text-indigo-700">Request Leave</span>
                                </Link>
                                <Link
                                    href="/faculty/timetable"
                                    className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">🕒</span>
                                    <span className="font-semibold text-purple-700">View Timetable</span>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Leaves Status */}
                    {recentLeaves.length > 0 && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                    Recent Leaves
                                </CardTitle>
                                <Link href="/faculty/leaves" className="text-primary-600 hover:text-primary-700 text-xs font-medium">
                                    View History
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {recentLeaves.map(leave => (
                                    <div key={leave.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-gray-900">
                                                {formatDate(leave.startDate)}
                                            </span>
                                            <Badge variant={leave.status === 'approved' ? 'success' : leave.status === 'pending' ? 'outline' : 'High'}>
                                                {leave.status}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-gray-500 truncate">{leave.reason}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
