'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { Pizza } from '@/data/menu';
import { cn } from '@/lib/utils';

interface PizzaCardProps {
    pizza: Pizza;
    onAddToCart: (pizza: Pizza) => void;
}

const PizzaCard: React.FC<PizzaCardProps> = ({ pizza, onAddToCart }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleAdd = () => {
        if (!pizza.activo) return;
        onAddToCart(pizza);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "group relative bg-capriccio-card rounded-[2rem] shadow-xl hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] transition-all duration-500 overflow-hidden border border-white/5 flex flex-col h-full",
                !pizza.activo && "opacity-80"
            )}
        >
            {/* Image Container */}
            <div className="relative h-64 w-full overflow-hidden bg-black">
                <Image
                    src={pizza.imagen}
                    alt={pizza.nombre}
                    fill
                    className={cn(
                        "object-cover transition-transform duration-700 opacity-90",
                        isHovered && pizza.activo ? "scale-110" : "scale-100",
                        !pizza.activo && "grayscale brightness-50"
                    )}
                />

                {pizza.activo && (
                    <div className="absolute inset-0 bg-gradient-to-t from-capriccio-card via-transparent to-transparent opacity-100 transition-opacity duration-500" />
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-capriccio-gold px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-capriccio-gold/20 shadow-sm">
                        {pizza.categoria}
                    </span>
                </div>

                {/* Agotado Badge */}
                {!pizza.activo && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-[2px]">
                        <span className="bg-capriccio-accent text-white px-8 py-3 rounded-2xl font-black text-xl italic uppercase tracking-widest shadow-2xl rotate-[-5deg] border-2 border-white/20">
                            AGOTADO
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow relative z-10 -mt-8">
                <div className="flex justify-between items-start mb-3">
                    <h3 className={cn(
                        "text-3xl font-title font-black text-white leading-tight uppercase tracking-tighter italic transition-colors drop-shadow-md",
                        !pizza.activo && "text-gray-500"
                    )}>
                        {pizza.nombre}
                    </h3>
                </div>

                <p className={cn(
                    "text-sm mb-6 leading-relaxed line-clamp-3 transition-colors flex-grow",
                    pizza.activo ? "text-gray-400" : "text-gray-600"
                )}>
                    {pizza.descripcion}
                </p>

                <div className="mt-auto">
                    <button
                        onClick={handleAdd}
                        disabled={!pizza.activo}
                        className={cn(
                            "w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                            !pizza.activo
                                ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
                                : "bg-transparent border-2 border-capriccio-gold text-capriccio-gold hover:bg-capriccio-gold hover:text-capriccio-dark hover:shadow-[var(--shadow-neon-yellow)] font-brand"
                        )}
                    >
                        {!pizza.activo ? (
                            <span>NO DISPONIBLE</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Plus className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
                                <span>Desde ${pizza.precio || 50}</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PizzaCard;
