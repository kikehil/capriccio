'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, User, MessageSquare, ArrowRight, LocateFixed, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserData {
    nombre: string;
    telefono: string;
    direccion: string;
    referencias: string;
    lat?: number;
    lng?: number;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (userData: UserData) => void;
    total: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onConfirm, total }) => {
    const [userData, setUserData] = useState<UserData>({
        nombre: '',
        telefono: '',
        direccion: '',
        referencias: ''
    });
    const [isSaved, setIsSaved] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem('pizza_user_data');
        if (savedData) {
            setUserData(JSON.parse(savedData));
            setIsSaved(true);
        }
    }, [isOpen]);

    const handleLocate = () => {
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const data = await response.json();

                // Extraer dirección simplificada
                const address = data.display_name;
                setUserData(prev => ({
                    ...prev,
                    direccion: address,
                    lat: latitude,
                    lng: longitude
                }));
            } catch (error) {
                console.error("Error geocoding:", error);
                alert("No pudimos traducir las coordenadas a una dirección.");
            } finally {
                setIsLocating(false);
            }
        }, (error) => {
            setIsLocating(false);
            alert("No pudimos obtener tu ubicación exacta.");
        }, { enableHighAccuracy: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('pizza_user_data', JSON.stringify(userData));
        onConfirm(userData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-lg bg-white rounded-[3rem] shadow-2xl z-[110] overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-title font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">Finalizar Pedido</h2>
                                    <p className="text-slate-400 font-bold italic text-sm">Tu pizza está a solo un paso.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">¿Quién recibe?</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Nombre completo"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-capriccio-gold/20 focus:bg-white rounded-2xl outline-none font-bold transition-all text-slate-900"
                                            value={userData.nombre}
                                            onChange={(e) => setUserData({ ...userData, nombre: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Teléfono de contacto</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                required
                                                type="tel"
                                                placeholder="10 dígitos"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-red-600/10 focus:bg-white rounded-2xl outline-none font-bold transition-all text-slate-900"
                                                value={userData.telefono}
                                                onChange={(e) => setUserData({ ...userData, telefono: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Total</label>
                                        <div className="w-full px-6 py-4 bg-capriccio-dark text-capriccio-gold rounded-2xl font-black text-xl italic flex items-center justify-between">
                                            <span>$</span>
                                            <span>{total}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Dirección de Entrega</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-4 text-slate-400 group-focus-within:text-capriccio-gold transition-colors" size={18} />
                                        <textarea
                                            required
                                            placeholder="Calle, número, colonia..."
                                            rows={2}
                                            className="w-full pl-12 pr-14 py-4 bg-slate-50 border-2 border-transparent focus:border-capriccio-gold/20 focus:bg-white rounded-2xl outline-none font-bold transition-all text-slate-900 resize-none"
                                            value={userData.direccion}
                                            onChange={(e) => setUserData({ ...userData, direccion: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleLocate}
                                            disabled={isLocating}
                                            className="absolute right-3 top-3 p-3 bg-capriccio-dark hover:bg-slate-900 text-white rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                            title="Usar mi ubicación actual"
                                        >
                                            {isLocating ? (
                                                <Loader2 size={18} className="animate-spin text-capriccio-gold" />
                                            ) : (
                                                <LocateFixed size={18} className="text-capriccio-gold" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Referencias (Opcional)</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ej: Portón verde, timbre descompuesto"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-red-600/10 focus:bg-white rounded-2xl outline-none font-bold transition-all text-slate-900"
                                            value={userData.referencias}
                                            onChange={(e) => setUserData({ ...userData, referencias: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {isSaved && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] text-green-600 font-black uppercase tracking-widest text-center"
                                    >
                                        ✓ Datos recordados de tu última pizza
                                    </motion.p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-capriccio-gold hover:bg-capriccio-gold/90 text-capriccio-dark py-6 rounded-[2rem] font-black text-xl italic uppercase tracking-widest shadow-xl shadow-capriccio-gold/20 active:scale-95 transition-all flex items-center justify-center gap-4 mt-8 group"
                                >
                                    ¡PEDIR AHORA!
                                    <ArrowRight className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;
