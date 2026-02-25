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
    const [isAdded, setIsAdded] = useState(false);

    const handleAdd = () => {
        if (!pizza.activo) return;
        onAddToCart(pizza);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onMouseEnter={() => !isAdded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "group relative bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100/50 flex flex-col h-full",
                !pizza.activo && "opacity-80"
            )}
        >
            {/* Image Container */}
            <div className="relative h-64 w-full overflow-hidden">
                <Image
                    src={pizza.imagen}
                    alt={pizza.nombre}
                    fill
                    className={cn(
                        "object-cover transition-all duration-700",
                        isHovered && pizza.activo ? "scale-110" : "scale-100",
                        !pizza.activo && "grayscale brightness-50"
                    )}
                />

                {pizza.activo && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 backdrop-blur-md text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                        {pizza.categoria}
                    </span>
                </div>

                {/* Agotado Badge */}
                {!pizza.activo && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <span className="bg-capriccio-accent text-white px-8 py-3 rounded-2xl font-black text-xl italic uppercase tracking-widest shadow-2xl rotate-[-5deg] border-4 border-white">
                            AGOTADO
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <h3 className={cn(
                        "text-2xl font-title font-black leading-tight uppercase tracking-tighter italic transition-colors",
                        pizza.activo ? "text-gray-900" : "text-gray-400"
                    )}>
                        {pizza.nombre}
                    </h3>
                    <div className="flex flex-col items-end">
                        <span className={cn(
                            "text-2xl font-black italic transition-colors",
                            pizza.activo ? "text-capriccio-gold" : "text-gray-300"
                        )}>
                            ${pizza.precio}
                        </span>
                    </div>
                </div>

                <p className={cn(
                    "text-sm mb-6 leading-relaxed line-clamp-2 transition-colors",
                    pizza.activo ? "text-gray-500" : "text-gray-300"
                )}>
                    {pizza.descripcion}
                </p>

                <div className="mt-auto">
                    <button
                        onClick={handleAdd}
                        disabled={!pizza.activo}
                        className={cn(
                            "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg",
                            !pizza.activo
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                : isAdded
                                    ? "bg-green-500 text-white scale-[0.98]"
                                    : "bg-capriccio-gold hover:bg-capriccio-gold/90 text-capriccio-dark hover:shadow-capriccio-gold/20 font-brand"
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {!pizza.activo ? (
                                <motion.span key="soldout">NO DISPONIBLE</motion.span>
                            ) : isAdded ? (
                                <motion.div
                                    key="check"
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <Check className="w-5 h-5" strokeWidth={3} />
                                    <span>¡AGREGADA!</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="add"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" strokeWidth={3} />
                                    <span>AL CARRITO</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PizzaCard;
