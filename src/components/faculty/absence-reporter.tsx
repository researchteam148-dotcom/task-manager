'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { reportAbsence } from '@/lib/db/absences';

interface AbsenceReporterProps {
    facultyUid: string;
    onSuccess?: (absenceId: string, subId?: string) => void;
}

export function AbsenceReporter({ facultyUid, onSuccess }: AbsenceReporterProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        reason: '',
    });

    const TIME_OPTIONS = [
        { value: '09:00', label: '09:00 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '11:15', label: '11:15 AM' },
        { value: '12:15', label: '12:15 PM' },
        { value: '14:00', label: '02:00 PM' },
        { value: '15:00', label: '03:00 PM' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            const result = await reportAbsence(
                facultyUid,
                new Date(formData.date),
                formData.startTime,
                formData.endTime,
                formData.reason
            );

            if (result) {
                const msg = result.substitutionId
                    ? "Absence reported! A substitute has been automatically assigned."
                    : "Absence reported. No available substitute found for this slot.";

                setStatus({ type: 'success', message: msg });
                if (onSuccess) onSuccess(result.absenceId, result.substitutionId);
            } else {
                setStatus({ type: 'error', message: "Failed to report absence. Please try again." });
            }
        } catch (err) {
            setStatus({ type: 'error', message: "An unexpected error occurred." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-md border-primary-100">
            <CardHeader className="bg-primary-50 px-6 py-4">
                <CardTitle className="text-primary-900 text-lg flex items-center gap-2">
                    <span>🚑</span> Report Absence / Manage Substitution
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Date of Absence"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Select
                                label="Start Time"
                                options={TIME_OPTIONS}
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                            <Select
                                label="End Time"
                                options={TIME_OPTIONS.map(o => ({ ...o, value: (parseInt(o.value.split(':')[0]) + 1).toString().padStart(2, '0') + ':00' }))}
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <Input
                        label="Reason (Optional)"
                        placeholder="e.g. Health issue, personal emergency"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />

                    {status && (
                        <div className={`p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {status.type === 'success' ? '✅ ' : '❌ '}{status.message}
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Report Absence & Find Substitute
                        </Button>
                        <p className="text-[10px] text-gray-500 text-center mt-2">
                            The system will automatically find a faculty member with a leisure period at this time.
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
