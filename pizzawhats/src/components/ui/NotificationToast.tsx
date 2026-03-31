'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationToastProps {
    message: string;
    type: NotificationType;
    isVisible: boolean;
    onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const icons = {
        success: <CheckCircle2 className="w-8 h-8 text-green-500" />,
        error: <XCircle className="w-8 h-8 text-red-500" />,
        info: <AlertCircle className="w-8 h-8 text-blue-500" />,
    };

    const colors = {
        success: "border-green-100 bg-white",
        error: "border-red-100 bg-white",
        info: "border-blue-100 bg-white",
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: "-50%", scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed bottom-32 left-1/2 z-[200] w-[90%] max-w-md"
                >
                    <div className={cn(
                        "relative flex items-center gap-5 p-5 rounded-[2rem] border shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl",
                        colors[type]
                    )}>
                        <div className="flex-shrink-0 animate-bounce-subtle">
                            {icons[type]}
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1 leading-none">
                                {type === 'success' ? 'Éxito Total' : 'Atención'}
                            </p>
                            <p className="text-xl font-black italic text-gray-900 leading-tight">
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors self-center"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 5, ease: "linear" }}
                            className={cn(
                                "absolute bottom-0 left-8 right-8 h-1 rounded-full opacity-30",
                                type === 'success' ? "bg-green-500" : "bg-red-500"
                            )}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationToast;
