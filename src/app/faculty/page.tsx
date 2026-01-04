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
        { label: 'Total Tasks', value: stats.total, color: 'text-blue-600', bgColor: 'bg-blue-50', icon: '📊' },
        { label: 'Pending', value: stats.pending, color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: '⏳' },
        { label: 'Active Subs', value: mySubstitutions.length, color: 'text-purple-600', bgColor: 'bg-purple-50', icon: '🔄' }, // New stat
        { label: 'Completed', value: stats.completed, color: 'text-green-600', bgColor: 'bg-green-50', icon: '✅' },
        { label: 'High Priority', value: stats.highPriority, color: 'text-red-600', bgColor: 'bg-red-50', icon: '🔥' },
        { label: 'Overdue', value: stats.overdue, color: 'text-red-600', bgColor: 'bg-red-50', icon: '⚠️' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Faculty Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your routine and assigned tasks</p>
                </div>
                {user && (
                    <Badge variant="purple" className="px-3 py-1 bg-white shadow-sm border-primary-100 text-primary-700 font-medium">
                        📍 {user.department} Department
                    </Badge>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    <span className="text-xl">{stat.icon}</span>
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
                        <CardHeader>
                            <CardTitle>Priority Tasks</CardTitle>
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
