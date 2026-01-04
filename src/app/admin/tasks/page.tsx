'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { subscribeToAllTasks, deleteTask, updateTaskStatus } from '@/lib/db/tasks';
import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, isOverdue } from '@/lib/utils';

export default function AdminTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    const unsubscribe = subscribeToAllTasks((updatedTasks) => {
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedToName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [searchQuery, statusFilter, priorityFilter, tasks]);

  const handleDelete = async (taskId: string) => {
    if (!user) return;

    if (confirm('Are you sure you want to delete this task?')) {
      const success = await deleteTask(taskId, user.uid);
      if (!success) {
        alert('Failed to delete task');
      }
    }
  };

  const renderTaskCard = (task: Task) => {
    const overdue = task.status !== 'Completed' && isOverdue(task.deadline);

    return (
      <div
        key={task.id}
        className={`p-4 border rounded-xl transition-all hover:shadow-md ${overdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
          }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-900">{task.title}</h3>
              <Badge variant={task.status}>{task.status}</Badge>
              <Badge variant={task.priority}>{task.priority}</Badge>
              {overdue && (
                <span className="text-xs font-medium text-red-600">⚠️ Overdue</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="text-sm">👤</span>
                Assigned to: <strong className="text-gray-900">{task.assignedToName}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-sm">📅</span>
                Deadline: <strong className="text-gray-900">{formatDate(task.deadline)}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-sm">👨‍💼</span>
                Created by: <strong className="text-gray-900">{task.createdByName}</strong>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/tasks/${task.id}/edit`}>
              <Button variant="outline" size="sm" className="h-8">
                ✏️ Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              className="h-8"
              onClick={() => handleDelete(task.id)}
            >
              🗑️ Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all tasks</p>
        </div>
        <Link href="/admin/tasks/create">
          <Button variant="primary">
            ➕ Create New Task
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {tasks.length === 0 ? 'No tasks yet. Create your first task!' : 'No tasks match your filters.'}
            </p>
          ) : (
            <div className="space-y-8">
              {/* Active Tasks Section */}
              {filteredTasks.filter(t => t.status !== 'Completed').length > 0 && (
                <div className="space-y-3">
                  {filteredTasks
                    .filter(t => t.status !== 'Completed')
                    .map((task) => renderTaskCard(task))}
                </div>
              )}

              {/* Completed Tasks Section */}
              {filteredTasks.filter(t => t.status === 'Completed').length > 0 && (
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-lg">✅</span>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Completed Tasks ({filteredTasks.filter(t => t.status === 'Completed').length})
                    </h3>
                  </div>
                  <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                    {filteredTasks
                      .filter(t => t.status === 'Completed')
                      .map((task) => renderTaskCard(task))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Total:</strong> {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' ? ' (filtered)' : ''}
        </p>
      </div>
    </div>
  );
}
