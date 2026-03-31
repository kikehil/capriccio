'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Zap } from 'lucide-react';
import { API_URL, getSocket } from '@/lib/socket';

interface Promotion {
    id: number;
    titulo: string;
    subtitulo: string;
    precio: number | string;
    color: string;
    imagen: string;
    badge: string;
}

const PromoSlider: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPromos = async () => {
        try {
            const res = await fetch(`${API_URL}/api/promos`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setPromos(data);
            }
            setIsLoading(false);
        } catch (e) {
            console.error("Error fetching promos slider:", e);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();

        const socket = getSocket();
        if (socket) {
            socket.on('promos_actualizadas', (updatedPromos: Promotion[]) => {
                if (Array.isArray(updatedPromos) && updatedPromos.length > 0) {
                    setPromos(updatedPromos);
                    setCurrent(0); // Reset to first on update
                }
            });
            return () => { socket.off('promos_actualizadas'); };
        }
    }, []);

    useEffect(() => {
        if (promos.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === promos.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(timer);
    }, [promos]);

    if (isLoading || promos.length === 0) return <div className="h-[400px] md:h-[500px] bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-capriccio-gold rounded-full" />
    </div>;

    const promo = promos[current];

    return (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-capriccio-dark group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={promo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className={cn(
                        "absolute inset-0 flex items-center p-6 md:p-12 bg-gradient-to-br transition-all duration-1000",
                        promo.color
                    )}
                >
                    {/* Background Decorative element */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />

                    <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                        <div className="text-white space-y-4 md:space-y-6 flex-1 text-center md:text-left">
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-xl mx-auto md:mx-0"
                            >
                                <Zap className="w-3 h-3 fill-current" />
                                {promo.badge}
                            </motion.div>

                            <div className="space-y-2">
                                <motion.h2
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-5xl md:text-8xl font-title font-black italic uppercase leading-[0.85] tracking-tighter drop-shadow-2xl"
                                >
                                    {promo.titulo.split(' ').map((word, i) => (
                                        <span key={i} className={i % 2 !== 0 ? "text-capriccio-gold" : ""}>
                                            {word}{' '}
                                        </span>
                                    ))}
                                </motion.h2>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg md:text-3xl font-bold opacity-90 italic tracking-tight"
                                >
                                    {promo.subtitulo}
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col md:flex-row items-center gap-6 pt-4"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-80">Precio Especial</span>
                                    <span className="text-5xl md:text-7xl font-black text-white italic leading-none drop-shadow-lg">
                                        {typeof promo.precio === 'number' ? `$${promo.precio}` : promo.precio}
                                    </span>
                                </div>

                                <a
                                    href="#menu"
                                    className="bg-white text-black px-10 py-5 rounded-[2rem] font-black text-xl italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 group/btn"
                                >
                                    ORDENAR
                                    <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                                </a>
                            </motion.div>
                        </div>

                        {/* Image Section */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: 'spring', damping: 12 }}
                            className="flex-1 hidden lg:flex justify-center items-center"
                        >
                            <div className="relative animate-float pointer-events-none">
                                <div className="absolute inset-0 bg-white/20 blur-[100px] rounded-full" />
                                <img
                                    src={promo.imagen}
                                    alt="Pizza Promo"
                                    className="relative w-full max-w-[500px] drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] rounded-[3rem] object-cover aspect-square"
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {promos.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={cn(
                            "h-2.5 rounded-full transition-all duration-500",
                            i === current ? "w-12 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "w-2.5 bg-white/30 hover:bg-white/50"
                        )}
                    />
                ))}
            </div>

            {/* Side arrows for desktop */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button
                    onClick={() => setCurrent(prev => (prev === 0 ? promos.length - 1 : prev - 1))}
                    className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all pointer-events-auto shadow-xl"
                >
                    <ArrowRight className="w-6 h-6 rotate-180" />
                </button>
                <button
                    onClick={() => setCurrent(prev => (prev === promos.length - 1 ? 0 : prev + 1))}
                    className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all pointer-events-auto shadow-xl"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default PromoSlider;
