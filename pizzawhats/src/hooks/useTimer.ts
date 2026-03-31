'use client';

import { useState, useEffect } from 'react';

export const useTimer = (createdAt: string) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const dateObj = new Date(createdAt);
        const startTime = isNaN(dateObj.getTime()) ? new Date().getTime() : dateObj.getTime();

        // Initial sync
        const now = new Date().getTime();
        setSeconds(Math.floor((now - startTime) / 1000));

        const interval = setInterval(() => {
            const now = new Date().getTime();
            setSeconds(Math.floor((now - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [createdAt]);

    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.max(0, seconds % 60);

    return {
        days,
        hours,
        minutes,
        seconds: remainingSeconds,
        totalSeconds: seconds
    };
};
