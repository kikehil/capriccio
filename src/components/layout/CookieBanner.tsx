'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const CookieBanner = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('capriccio_cookies_ok');
        if (!accepted) setVisible(true);
    }, []);

    const accept = () => {
        localStorage.setItem('capriccio_cookies_ok', '1');
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[300] bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl"
                >
                    <div className="flex items-start gap-3">
                        <Cookie size={20} className="text-capriccio-gold shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-white font-black text-sm mb-1">Almacenamiento local</p>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Usamos almacenamiento local para recordar tus datos de entrega y facilitar futuros pedidos. No usamos cookies de rastreo.{' '}
                                <a href="/privacidad" className="text-capriccio-gold hover:underline font-bold">
                                    Aviso de Privacidad
                                </a>
                            </p>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={accept}
                                    className="flex-1 bg-capriccio-gold text-slate-900 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all"
                                >
                                    Entendido
                                </button>
                                <button
                                    onClick={accept}
                                    className="p-2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
