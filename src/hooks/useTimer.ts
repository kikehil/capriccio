'use client';

import { useState, useEffect } from 'react';

// SQLite guarda CURRENT_TIMESTAMP en UTC pero sin "Z" al final.
// Ej: "2026-03-30 17:06:43" → es UTC, no hora local.
// Si tiene "T" y "Z" ya es ISO correcto.
// Si no tiene "T" ni "Z", asumimos UTC y le agregamos "Z".
const parseAsUTC = (dateStr: string): number => {
    if (!dateStr) return Date.now();
    let s = dateStr.trim();
    // Ya es ISO con Z → parsear directo
    if (s.includes('Z')) {
        const d = new Date(s);
        return isNaN(d.getTime()) ? Date.now() : d.getTime();
    }
    // Tiene T pero no Z (ej: "2026-03-30T17:06:43") → agregar Z
    if (s.includes('T')) {
        const d = new Date(s + 'Z');
        return isNaN(d.getTime()) ? Date.now() : d.getTime();
    }
    // Formato SQLite "YYYY-MM-DD HH:mm:ss" → agregar T y Z para forzar UTC
    s = s.replace(' ', 'T') + 'Z';
    const d = new Date(s);
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
};

export { parseAsUTC };

export const useTimer = (createdAt: string) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const startTime = parseAsUTC(createdAt);

        // Initial sync
        const now = Date.now();
        setSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));

        const interval = setInterval(() => {
            const now = Date.now();
            setSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));
        }, 1000);

        return () => clearInterval(interval);
    }, [createdAt]);

    const totalSec = Math.max(0, seconds);
    const days = Math.floor(totalSec / (24 * 3600));
    const hours = Math.floor((totalSec % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const remainingSeconds = totalSec % 60;

    return {
        days,
        hours,
        minutes,
        seconds: remainingSeconds,
        totalSeconds: totalSec
    };
};
