'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { updateUser } from '@/lib/db/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS } from '@/lib/constants';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        photoURL: '',
        department: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                photoURL: user.photoURL || '',
                department: user.department || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage(null);

        try {
            await updateUser(user.uid, formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const getRoleLabel = (role: string) => {
        if (role === 'admin') return 'Head of Department';
        if (role === 'dean') return 'Dean';
        return 'Faculty';
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-4 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Profile</h1>
                    <p className="text-slate-500 mt-1">Manage your identity and platform preferences</p>
                </div>
                <Badge variant={user.role === 'admin' ? 'High' : user.role === 'dean' ? 'purple' : 'Medium'} className="px-4 py-1 text-sm rounded-full shadow-sm">
                    {getRoleLabel(user.role).toUpperCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="lg:col-span-1 border-none shadow-xl bg-white/40 backdrop-blur-xl overflow-hidden group">
                    <div className="h-24 bg-gradient-to-r from-primary-600 to-indigo-600" />
                    <CardContent className="relative pt-0 px-6 pb-8">
                        <div className="flex flex-col items-center">
                            <div className="relative -mt-12 group">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-200 transition-transform duration-500 group-hover:scale-105">
                                    {formData.photoURL ? (
                                        <img src={formData.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-400">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-2xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Preview</span>
                                </div>
                            </div>

                            <h2 className="mt-4 text-xl font-bold text-slate-900">{user.name}</h2>
                            <p className="text-sm text-slate-500 font-medium">{user.email}</p>

                            <div className="mt-6 w-full space-y-4">
                                <div className="p-3 bg-white/50 rounded-xl border border-slate-100/50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Employee ID</p>
                                    <p className="font-bold text-slate-700">{user.empId}</p>
                                </div>
                                <div className="p-3 bg-white/50 rounded-xl border border-slate-100/50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Joined</p>
                                    <p className="font-bold text-slate-700">{user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <Card className="lg:col-span-2 border-none shadow-xl bg-white/40 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100/50 pb-6">
                        <CardTitle className="text-xl font-bold text-slate-900">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {message && (
                                <div className={`p-4 rounded-xl text-sm font-medium animate-slide-up ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400/60"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Department {user.role !== 'dean' && '(Read Only)'}</label>
                                    <select
                                        className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        disabled={true} // Strict constraint: Department is assigned by system
                                    >
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Profile Picture URL</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400/60"
                                    placeholder="https://example.com/avatar.jpg"
                                    value={formData.photoURL}
                                    onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-400 italic">Provide a public URL for your profile image.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">About/Bio</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[120px] resize-none"
                                    placeholder="Tell us a bit about yourself..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    className="px-8 h-12 rounded-xl text-md font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                                    isLoading={isSaving}
                                >
                                    {isSaving ? 'Synchronizing...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div >
        </div >
    );
}
