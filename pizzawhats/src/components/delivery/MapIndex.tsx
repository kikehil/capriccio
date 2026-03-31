'use client';

import dynamic from 'next/dynamic';
import React from 'react';

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
    destination: {
        lat: number;
        lng: number;
        address: string;
    };
    currentPos?: {
        lat: number;
        lng: number;
    };
}

export const RepartidorMap = dynamic<MapModalProps>(
    () => import('./MapComponent'),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-black italic uppercase tracking-tighter">Iniciando Sistemas GPS...</p>
                </div>
            </div>
        )
    }
);
