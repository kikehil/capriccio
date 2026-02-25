'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Bike, X } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import { CartItem } from '@/data/cart';
import { cn } from '@/lib/utils';

interface Repartidor {
    nombre: string;
    socketId: string;
}

interface OrderCardProps {
    order: {
        id: string;
        items: CartItem[];
        createdAt: string;
        timestamp: string;
    };
    onComplete: (id: string, repartidor?: string) => void;
    repartidoresOnline: Repartidor[];
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onComplete, repartidoresOnline }) => {
    const { days, hours, minutes, seconds, totalSeconds } = useTimer(order.createdAt);
    const [showSelector, setShowSelector] = useState(false);

    // Dynamic styles based on time
    let statusColor = "bg-slate-900 border-slate-800";
    let timerColor = "text-yellow-400";
    let accentColor = "text-white";
    let isCritical = false;

    if (totalSeconds > 600 && totalSeconds <= 900) {
        statusColor = "bg-yellow-400 border-yellow-500";
        timerColor = "text-black";
        accentColor = "text-black";
    } else if (totalSeconds > 900) {
        statusColor = "bg-red-600 border-red-700 animate-pulse";
        timerColor = "text-white";
        accentColor = "text-white";
        isCritical = true;
    }

    const formatTime = () => {
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    };

    const handleAssign = (nombre: string) => {
        onComplete(order.id, nombre);
        setShowSelector(false);
    };

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full border-2 border-slate-100 relative"
        >
            <div className={cn("p-6 flex justify-between items-center transition-colors duration-500", statusColor)}>
                <div>
                    <span className={cn("text-[10px] uppercase font-black tracking-[0.2em] opacity-60", accentColor)}>Pedido</span>
                    <p className={cn("text-2xl font-black italic uppercase leading-none", accentColor)}>
                        #{order.id.split('-')[1] || order.id.slice(-4)}
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <div className={cn("flex items-center gap-2", timerColor)}>
                        <Clock className={cn("w-5 h-5", isCritical && "animate-spin-slow")} />
                        <span className={cn("font-black tabular-nums italic leading-none",
                            totalSeconds > 3600 ? "text-xl" : "text-3xl"
                        )}>
                            {formatTime()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-8 flex-grow space-y-6">
                {order.items.map((item, idx) => (
                    <div key={idx} className="relative pl-6 border-l-4 border-slate-100 font-title">
                        <p className="text-2xl font-black italic text-slate-900 uppercase leading-none tracking-tighter mb-2">
                            {item.quantity}x {item.nombre}
                        </p>
                        {item.extras && item.extras.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {item.extras.map((extra: any, eIdx: number) => (
                                    <span key={eIdx} className="text-[10px] font-black bg-red-50 text-red-600 px-2 py-1 rounded-lg uppercase italic flex items-center gap-1">
                                        <Check className="w-2 h-2 stroke-[4px]" />
                                        {extra.nombre}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-6 pt-0 relative">
                <AnimatePresence>
                    {showSelector && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="absolute inset-x-0 bottom-0 bg-slate-950 p-6 rounded-t-[2.5rem] z-20 border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-white font-black italic uppercase tracking-widest text-xs">Asignar Repartidor</h4>
                                <button onClick={() => setShowSelector(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {repartidoresOnline.length === 0 ? (
                                    <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        <p className="text-slate-500 font-black italic uppercase text-[10px]">Sin repartidores online</p>
                                    </div>
                                ) : (
                                    repartidoresOnline.map((rep, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAssign(rep.nombre)}
                                            className="w-full bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl flex items-center justify-between transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-capriccio-gold rounded-xl flex items-center justify-center text-slate-900">
                                                    <Bike size={16} strokeWidth={3} />
                                                </div>
                                                <span className="font-black italic uppercase text-sm tracking-tight">{rep.nombre}</span>
                                            </div>
                                            <Check size={16} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))
                                )}

                                <button
                                    onClick={() => handleAssign('S/A')}
                                    className="w-full mt-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 p-4 rounded-2xl font-black italic uppercase text-xs tracking-widest transition-all"
                                >
                                    Omitir Asignación
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setShowSelector(true)}
                    className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black text-xl italic uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 overflow-hidden group relative"
                >
                    <div className="absolute inset-0 bg-green-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 flex items-center gap-3">
                        <Check className="w-7 h-7 stroke-[4px] group-hover:scale-110 transition-transform" />
                        DESPACHAR
                    </span>
                </button>
            </div>
        </motion.div>
    );
};

export default OrderCard;
