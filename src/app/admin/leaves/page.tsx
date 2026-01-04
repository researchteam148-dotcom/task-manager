'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { LeaveRequest } from '@/types';
import { subscribeToPendingLeaves, subscribeToProcessedLeaves, updateLeaveStatus } from '@/lib/db/leaves';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function AdminLeavesPage() {
    const { user } = useAuth();
    const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
    const [processedLeaves, setProcessedLeaves] = useState<LeaveRequest[]>([]);
    const [isPendingLoading, setIsPendingLoading] = useState(true);
    const [isProcessedLoading, setIsProcessedLoading] = useState(true);
    const [pendingError, setPendingError] = useState<string | null>(null);
    const [processedError, setProcessedError] = useState<string | null>(null);
    const [adminComments, setAdminComments] = useState<Record<string, string>>({});
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribePending = subscribeToPendingLeaves(
            (data) => {
                setPendingLeaves(data);
                setIsPendingLoading(false);
                setPendingError(null);
            },
            (error) => {
                setIsPendingLoading(false);
                setPendingError(error.message.includes('requires an index') ? 'INDEX_MISSING' : error.message);
            }
        );

        const unsubscribeProcessed = subscribeToProcessedLeaves(
            (data) => {
                setProcessedLeaves(data);
                setIsProcessedLoading(false);
                setProcessedError(null);
            },
            (error) => {
                setIsProcessedLoading(false);
                setProcessedError(error.message.includes('requires an index') ? 'INDEX_MISSING' : error.message);
            }
        );

        return () => {
            unsubscribePending();
            unsubscribeProcessed();
        };
    }, []);

    const handleAction = async (leaveId: string, status: 'approved' | 'rejected') => {
        if (!user) return;
        setProcessingId(leaveId);
        try {
            await updateLeaveStatus(
                leaveId,
                status,
                user.uid,
                adminComments[leaveId] || ''
            );
        } catch (error) {
            console.error('Error processing leave:', error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
                <p className="text-gray-600 mt-1">Review and track faculty leave requests</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            <span>⏳</span> {isPendingLoading ? 'Loading Pending...' : 'Pending Requests'}
                        </span>
                        {!isPendingLoading && !pendingError && <Badge variant="Pending">{pendingLeaves.length}</Badge>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isPendingLoading ? (
                        <div className="p-12 flex flex-col items-center justify-center space-y-3">
                            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                            <p className="text-gray-500">Checking for new requests...</p>
                        </div>
                    ) : pendingError === 'INDEX_MISSING' ? (
                        <div className="p-8 text-center bg-amber-50 rounded-xl border border-amber-200">
                            <p className="text-amber-800 font-medium">Database expansion required to view pending leaves.</p>
                            <p className="text-xs text-amber-600 mt-1">Please check the browser console for the setup link.</p>
                        </div>
                    ) : pendingLeaves.length === 0 ? (
                        <div className="p-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <span className="text-5xl mb-4 block">🏝️</span>
                            <p className="text-gray-500 font-medium">No pending leave requests to review.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {pendingLeaves.map((leave) => (
                                <div key={leave.id} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                                                    {leave.facultyName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{leave.facultyName}</h3>
                                                    <p className="text-xs text-gray-500">Submitted on {formatDate(leave.createdAt)}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Start Date</p>
                                                    <p className="font-semibold text-gray-900">{formatDate(leave.startDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">End Date</p>
                                                    <p className="font-semibold text-gray-900">{formatDate(leave.endDate)}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Reason</p>
                                                <p className="text-sm text-gray-700 leading-relaxed">{leave.reason}</p>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-80 space-y-4 pt-6 lg:pt-0 lg:border-l lg:pl-6 border-gray-100">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase flex justify-between">
                                                    Admin Comment <span>Optional</span>
                                                </label>
                                                <textarea
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none min-h-[100px]"
                                                    placeholder="Add feedback or reason for rejection..."
                                                    value={adminComments[leave.id] || ''}
                                                    onChange={(e) => setAdminComments({ ...adminComments, [leave.id]: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleAction(leave.id, 'rejected')}
                                                    isLoading={processingId === leave.id}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    className="flex-1"
                                                    onClick={() => handleAction(leave.id, 'approved')}
                                                    isLoading={processingId === leave.id}
                                                >
                                                    Approve
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Processed Leaves History */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 px-2">
                    <span>📜</span> Processed History
                </h2>
                <Card>
                    <CardContent className="p-0 overflow-hidden">
                        {isProcessedLoading ? (
                            <div className="p-10 text-center">
                                <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Loading history...</p>
                            </div>
                        ) : processedError === 'INDEX_MISSING' ? (
                            <div className="p-8 text-center bg-amber-50 rounded-xl m-4 border border-amber-200">
                                <p className="text-amber-800 font-medium text-sm">Processed history index is being built.</p>
                                <p className="text-[10px] text-amber-600 mt-1 uppercase font-bold">Check console for link</p>
                            </div>
                        ) : processedLeaves.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 italic">
                                No processed records found.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {processedLeaves.map((leave) => (
                                    <div key={leave.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold shrink-0">
                                                    {leave.facultyName.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 truncate">{leave.facultyName}</h4>
                                                        <Badge variant={leave.status === 'approved' ? 'Completed' : 'High'}>
                                                            {leave.status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Processed on</p>
                                                <p className="text-xs font-medium text-gray-600">{formatDate(leave.updatedAt || leave.createdAt)}</p>
                                            </div>
                                        </div>
                                        {leave.adminComment && (
                                            <div className="mt-3 ml-14 p-3 bg-gray-50 rounded-lg border-l-2 border-gray-200">
                                                <p className="text-xs text-gray-600 italic">"{leave.adminComment}"</p>
                                            </div>
                                        )}
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
