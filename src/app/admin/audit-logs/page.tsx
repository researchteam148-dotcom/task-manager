'use client';

import React, { useState, useEffect } from 'react';
import { getAllAuditLogs } from '@/lib/db/audit-logs';
import { AuditLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/utils';

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('All');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        const auditLogs = await getAllAuditLogs(200);
        setLogs(auditLogs);
        setFilteredLogs(auditLogs);
    };

    useEffect(() => {
        let filtered = [...logs];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(log =>
                log.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.performedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.details?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Action filter
        if (actionFilter !== 'All') {
            filtered = filtered.filter(log => log.action === actionFilter);
        }

        setFilteredLogs(filtered);
    }, [searchQuery, actionFilter, logs]);

    const actionTypes = ['All', 'Created', 'Updated', 'Status Changed', 'Completed', 'Comment Added', 'Deleted'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-gray-600 mt-1">Complete history of all task operations</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            {actionTypes.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredLogs.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No audit logs found</p>
                    ) : (
                        <div className="space-y-2">
                            {filteredLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-4 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="w-32 flex-shrink-0 text-sm text-gray-500">
                                        {formatDateTime(log.timestamp)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-xs rounded font-medium ${log.action === 'Created' ? 'bg-green-100 text-green-800' :
                                                    log.action === 'Updated' || log.action === 'Status Changed' ? 'bg-blue-100 text-blue-800' :
                                                        log.action === 'Completed' ? 'bg-green-100 text-green-800' :
                                                            log.action === 'Deleted' ? 'bg-red-100 text-red-800' :
                                                                log.action === 'Comment Added' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {log.action}
                                            </span>
                                            <span className="font-medium text-gray-900">{log.taskTitle || 'Unknown Task'}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            <strong>{log.performedByName || 'Unknown User'}</strong> {log.details || 'performed an action'}
                                        </p>
                                        {log.previousValue && log.newValue && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Changed from <strong>{log.previousValue}</strong> to <strong>{log.newValue}</strong>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Total:</strong> {filteredLogs.length} log entr{filteredLogs.length !== 1 ? 'ies' : 'y'}
                    {searchQuery || actionFilter !== 'All' ? ' (filtered)' : ''}
                </p>
            </div>
        </div>
    );
}
