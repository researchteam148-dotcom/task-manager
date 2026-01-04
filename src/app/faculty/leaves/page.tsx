'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { LeaveRequest } from '@/types';
import { requestLeave, subscribeToFacultyLeaves } from '@/lib/db/leaves';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function FacultyLeavesPage() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
    });

    useEffect(() => {
        if (!user?.uid) return;

        setIsHistoryLoading(true);
        setHistoryError(null);

        const unsubscribe = subscribeToFacultyLeaves(
            user.uid,
            (data) => {
                setLeaves(data);
                setIsHistoryLoading(false);
                setHistoryError(null);
            },
            (error) => {
                setIsHistoryLoading(false);
                if (error.message.includes('requires an index')) {
                    setHistoryError('DATABASE_INDEX_MISSING');
                } else {
                    setHistoryError(error.message);
                }
            }
        );

        return () => unsubscribe();
    }, [user?.uid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);

        try {
            await requestLeave(
                user.uid,
                user.name,
                formData.startDate,
                formData.endDate,
                formData.reason
            );
            setFormData({ startDate: '', endDate: '', reason: '' });
        } catch (error) {
            console.error('Error submitting leave:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
                <p className="text-gray-600 mt-1">Submit and track your leave requests</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submit Request Form */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>📝</span> New Leave Request
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Start Date"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <Input
                                label="End Date"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                                min={formData.startDate || new Date().toISOString().split('T')[0]}
                            />
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Reason</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none min-h-[100px]"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    required
                                    placeholder="Explain the reason for your leave..."
                                />
                            </div>
                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Submit Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Leave History */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>My Leave History</span>
                            {isHistoryLoading && (
                                <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full" />
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isHistoryLoading ? (
                            <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                                <p className="text-gray-500 font-medium">Loading history...</p>
                            </div>
                        ) : historyError === 'DATABASE_INDEX_MISSING' ? (
                            <div className="p-8 text-center bg-amber-50 rounded-xl border border-amber-200">
                                <span className="text-3xl mb-3 block">⚙️</span>
                                <h4 className="font-bold text-amber-900 mb-1">Database Index Required</h4>
                                <p className="text-sm text-amber-800">
                                    A Firestore index is required to show your history.
                                    Please check your <strong>browser console (F12)</strong> for the blue link to enable it.
                                </p>
                            </div>
                        ) : historyError ? (
                            <div className="p-8 text-center bg-red-50 rounded-xl border border-red-200 text-red-700">
                                <p>Error loading history: {historyError}</p>
                            </div>
                        ) : leaves.length === 0 ? (
                            <div className="p-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                <span className="text-4xl mb-3 block">📂</span>
                                <p className="text-gray-500 font-medium">No leave requests found.</p>
                                <p className="text-xs text-gray-400 mt-1">Your submitted requests will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {leaves.map((leave) => (
                                    <div key={leave.id} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">
                                                    {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    {leave.reason}
                                                </p>
                                            </div>
                                            <Badge variant={leave.status === 'pending' ? 'Pending' : leave.status === 'approved' ? 'Completed' : 'High'}>
                                                {leave.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        {leave.adminComment && (
                                            <div className="mt-4 p-4 bg-primary-50/50 rounded-xl border-l-4 border-primary-500 shadow-sm">
                                                <p className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Admin Feedback</p>
                                                <p className="text-sm text-gray-700 mt-1 italic font-medium leading-relaxed">"{leave.adminComment}"</p>
                                            </div>
                                        )}
                                        <div className="mt-3 flex justify-end">
                                            <p className="text-[10px] font-medium text-gray-400">Submitted {formatDate(leave.createdAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
