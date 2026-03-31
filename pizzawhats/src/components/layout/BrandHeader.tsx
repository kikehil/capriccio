'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

const BrandHeader = () => {
    return (
        <header className="bg-capriccio-dark/95 backdrop-blur-md p-4 sticky top-0 z-[100] border-b border-capriccio-gold/20 shadow-2xl">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* LOGO ADAPTADO */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-4 group cursor-pointer"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <img
                        src="/img/capriccio-logo.svg"
                        alt="Capriccio Logo"
                        className="relative h-16 w-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                </motion.div>

                {/* NAVIGATION - DESKTOP */}
                <nav className="hidden lg:flex items-center gap-8">
                    {['Menú', 'Promos', 'Nosotros', 'Contacto'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-white/70 hover:text-capriccio-gold font-brand font-bold text-xs uppercase tracking-widest transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-capriccio-gold transition-all group-hover:w-full" />
                        </a>
                    ))}
                </nav>

                {/* INDICADOR DE SUCURSAL PANUCO */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col items-end"
                >
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm group hover:border-capriccio-gold/30 transition-all">
                        <MapPin className="text-capriccio-gold w-4 h-4 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-xs leading-none">Pánuco</span>
                            <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Veracruz</span>
                        </div>
                    </div>
                    {/* Badge de Horario o Estado */}
                    <div className="mt-1 mr-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-500 text-[9px] font-black uppercase tracking-wider">Abierto Ahora</span>
                    </div>
                </motion.div>

            </div>
        </header>
    );
};

export default BrandHeader;
