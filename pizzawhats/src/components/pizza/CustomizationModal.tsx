'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Pizza } from '@/data/menu';
import { extraOptions, ExtraOption } from '@/data/options';
import { cn } from '@/lib/utils';

interface CustomizationModalProps {
    pizza: Pizza | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (pizza: Pizza, extras: ExtraOption[], finalPrice: number) => void;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({ pizza, isOpen, onClose, onConfirm }) => {
    const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);

    // Reset selection when modal opens with a new pizza
    useEffect(() => {
        if (isOpen) {
            setSelectedExtras([]);
        }
    }, [isOpen]);

    if (!pizza) return null;

    const toggleExtra = (extra: ExtraOption) => {
        if (selectedExtras.find(e => e.id === extra.id)) {
            setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
        } else {
            setSelectedExtras([...selectedExtras, extra]);
        }
    };

    const finalPrice = pizza.precio + selectedExtras.reduce((acc, e) => acc + e.precio, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-2xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] flex flex-col md:flex-row h-[90vh] md:h-auto"
                    >
                        {/* Image Section - Left side on desktop */}
                        <div className="relative w-full md:w-2/5 h-48 md:h-auto bg-capriccio-dark overflow-hidden">
                            <img
                                src={pizza.imagen}
                                alt={pizza.nombre}
                                className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 text-white">
                                <span className="bg-capriccio-gold text-capriccio-dark px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase inline-block mb-3">
                                    {pizza.categoria}
                                </span>
                                <h4 className="text-3xl font-title font-black italic uppercase italic leading-none">{pizza.nombre}</h4>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all md:hidden z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content Section - Right side */}
                        <div className="flex-1 flex flex-col max-h-full">
                            <div className="p-8 pb-4 hidden md:flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-title font-black text-gray-900 italic uppercase leading-none tracking-tighter mb-1">
                                        Personaliza
                                    </h2>
                                    <p className="text-gray-400 font-bold italic text-sm">Hazla a tu manera, sin límites.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 pt-2 md:pt-4 space-y-4 overflow-y-auto flex-grow scrollbar-hide">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Ingredientes Extra</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {extraOptions.map(extra => {
                                        const isSelected = selectedExtras.find(e => e.id === extra.id);
                                        return (
                                            <motion.label
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                key={extra.id}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                                                    isSelected
                                                        ? "border-capriccio-gold bg-capriccio-gold/5 shadow-md"
                                                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                        isSelected ? "bg-capriccio-gold border-capriccio-gold" : "border-gray-200"
                                                    )}>
                                                        {isSelected && <Check className="w-4 h-4 text-white stroke-[4px]" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={!!isSelected}
                                                        onChange={() => toggleExtra(extra)}
                                                    />
                                                    <span className={cn(
                                                        "font-bold text-lg italic transition-colors",
                                                        isSelected ? "text-capriccio-dark" : "text-gray-600"
                                                    )}>{extra.nombre}</span>
                                                </div>
                                                <span className={cn(
                                                    "font-black text-lg italic",
                                                    isSelected ? "text-capriccio-gold" : "text-gray-400"
                                                )}>+${extra.precio}</span>
                                            </motion.label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sticky Footer in Modal */}
                            <div className="p-8 bg-gray-50/50 backdrop-blur-md border-t border-gray-100 flex items-center gap-6 mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Item</span>
                                    <span className="text-3xl font-black text-gray-900 italic leading-none">${finalPrice}</span>
                                </div>
                                <button
                                    onClick={() => onConfirm(pizza, selectedExtras, finalPrice)}
                                    className="flex-1 bg-capriccio-gold text-capriccio-dark py-5 rounded-2xl font-black text-xl italic uppercase tracking-widest shadow-[0_10px_25px_rgba(234,179,8,0.3)] hover:bg-capriccio-gold/90 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                >
                                    AGREGAR
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CustomizationModal;
