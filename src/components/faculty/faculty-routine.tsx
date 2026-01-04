'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScheduleSlot, SlotType } from '@/types';

interface FacultyRoutineProps {
    slots: ScheduleSlot[];
    onUpdate?: (slots: ScheduleSlot[]) => void;
    readOnly?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:15', end: '12:15' },
    { start: '12:15', end: '13:15' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
];

export function FacultyRoutine({ slots, onUpdate, readOnly = false }: FacultyRoutineProps) {
    const getSlot = (day: string, startTime: string) => {
        return slots.find(s => s.day === day && s.startTime === startTime);
    };

    const toggleSlot = (day: string, period: { start: string, end: string }) => {
        if (readOnly || !onUpdate) return;

        const current = getSlot(day, period.start);
        let newSlots = [...slots];

        if (current) {
            // Toggle type or remove
            if (current.type === 'class') {
                newSlots = slots.map(s => s.id === current.id ? { ...s, type: 'leisure' as SlotType, subject: '' } : s);
            } else {
                newSlots = slots.filter(s => s.id !== current.id);
            }
        } else {
            // Add as class by default
            const newSlot: ScheduleSlot = {
                id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                day: day as any,
                startTime: period.start,
                endTime: period.end,
                type: 'class',
                subject: 'New Class'
            };
            newSlots.push(newSlot);
        }

        onUpdate(newSlots);
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Weekly Routine</CardTitle>
                    {!readOnly && (
                        <p className="text-xs text-gray-500">Click a slot to toggle Class / Leisure / Empty</p>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3 border-r border-b text-left text-xs font-semibold text-gray-600 w-24">Time</th>
                            {DAYS.map(day => (
                                <th key={day} className="p-3 border-b text-center text-xs font-semibold text-gray-600 min-w-[120px]">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map((period, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-3 border-r border-b text-xs font-medium text-gray-500 bg-gray-50">
                                    {period.start} - {period.end}
                                </td>
                                {DAYS.map(day => {
                                    const slot = getSlot(day, period.start);
                                    return (
                                        <td
                                            key={`${day}-${period.start}`}
                                            className="p-2 border-b text-center align-middle relative group"
                                            onClick={() => toggleSlot(day, period)}
                                        >
                                            <div className={`
                                                min-h-[60px] rounded-lg p-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1
                                                ${!slot ? 'border-2 border-dashed border-gray-100 hover:border-gray-200' : ''}
                                                ${slot?.type === 'class' ? 'bg-primary-50 border border-primary-100 text-primary-700' : ''}
                                                ${slot?.type === 'leisure' ? 'bg-green-50 border border-green-100 text-green-700' : ''}
                                            `}>
                                                {slot ? (
                                                    <>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                                            {slot.type === 'class' ? '📚 Class' : '☕ Leisure'}
                                                        </span>
                                                        {slot.subject && (
                                                            <span className="text-xs font-medium truncate w-full text-center">
                                                                {slot.subject}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Add Slot
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
