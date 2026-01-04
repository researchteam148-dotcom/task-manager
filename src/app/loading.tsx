'use client';

import React from 'react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-500">
            <div className="relative">
                {/* Outermost spinning ring */}
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-primary-500 animate-spin" />

                {/* Inner pulsing circle */}
                <div className="absolute inset-0 m-auto w-12 h-12 bg-primary-500 rounded-full animate-pulse blur-sm opacity-50" />

                {/* Core logo/icon */}
                <div className="absolute inset-0 m-auto w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-xl">T</span>
                </div>
            </div>

            <div className="mt-8 text-center space-y-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight animate-bounce">TaskFlow</h2>
                <div className="flex items-center gap-1 justify-center">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
                </div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest pt-2">Syncing your experience</p>
            </div>

            <style jsx global>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
            `}</style>
        </div>
    );
}
