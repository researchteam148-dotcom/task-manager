'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getFacultySchedule } from '@/lib/db/schedules';
import { ScheduleSlot } from '@/types';
import { FacultyRoutine } from '@/components/faculty/faculty-routine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TimetablePage() {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);

    useEffect(() => {
        if (!user) return;
        const loadSchedule = async () => {
            const data = await getFacultySchedule(user.uid);
            if (data) setSchedule(data.slots);
        };
        loadSchedule();
    }, [user]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Weekly Timetable</h1>
                <p className="text-gray-600 mt-1">View your official class schedule and leisure slots</p>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <FacultyRoutine
                    slots={schedule}
                    readOnly={true}
                />
            </Card>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                    <p className="text-sm font-semibold text-blue-900">Note to Faculty</p>
                    <p className="text-sm text-blue-700">
                        This view is read-only. To modify your routine, please use the editor on your main dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
}
