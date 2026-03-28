'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import CustomerAuthModal from '@/components/customer/CustomerAuthModal';

interface InvitaModalProps {
    onAuthSuccess?: (data: { nombre: string; telefono: string; puntos: number; token: string }) => void;
}

const InvitaModal: React.FC<InvitaModalProps> = ({ onAuthSuccess }) => {
    const [visible, setVisible] = useState(false);
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        // Solo mostrar si no hay sesión activa y no fue cerrado en esta sesión
        const token = localStorage.getItem('capriccio_cliente_token');
        const dismissed = sessionStorage.getItem('invita_dismissed');
        if (!token && !dismissed) {
            // Pequeño delay para que la página cargue primero
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        sessionStorage.setItem('invita_dismissed', '1');
        setVisible(false);
    };

    const handleAuthSuccess = (data: { nombre: string; telefono: string; puntos: number; token: string }) => {
        localStorage.setItem('capriccio_cliente_token', data.token);
        localStorage.setItem('capriccio_cliente_nombre', data.nombre);
        localStorage.setItem('capriccio_cliente_telefono', data.telefono);
        localStorage.setItem('capriccio_cliente_puntos', String(data.puntos || 0));
        setShowAuth(false);
        setVisible(false);
        onAuthSuccess?.(data);
    };

    return (
        <>
            <AnimatePresence>
                {visible && !showAuth && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="invita-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200]"
                        />

                        {/* Modal */}
                        <motion.div
                            key="invita-modal"
                            initial={{ opacity: 0, scale: 0.85, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 40 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-md z-[210]"
                        >
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(234,179,8,0.25)] border border-capriccio-gold/20">
                                {/* Botón cerrar */}
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-white/10"
                                >
                                    <X size={18} />
                                </button>

                                {/* Imagen clickeable */}
                                <button
                                    onClick={() => setShowAuth(true)}
                                    className="w-full block group focus:outline-none"
                                    aria-label="Registrarse y obtener beneficios"
                                >
                                    <img
                                        src="/invita.png"
                                        alt="Únete a Capriccio"
                                        className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                    />
                                </button>

                                {/* Footer */}
                                <div className="bg-capriccio-dark px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <button
                                        onClick={() => setShowAuth(true)}
                                        className="flex items-center gap-2 bg-capriccio-gold text-capriccio-dark px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-capriccio-gold/20 w-full sm:w-auto justify-center"
                                    >
                                        <UserPlus size={16} />
                                        Registrarme Gratis
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors underline underline-offset-4 w-full sm:w-auto text-center"
                                    >
                                        Continuar como invitado
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Auth modal — arrancar directamente en registro */}
            <CustomerAuthModal
                open={showAuth}
                onClose={() => setShowAuth(false)}
                onSuccess={handleAuthSuccess}
                initialStep="register"
            />
        </>
    );
};

export default InvitaModal;
