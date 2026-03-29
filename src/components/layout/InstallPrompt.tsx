'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Detectar si ya está instalada como PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Detectar iOS (Safari no dispara beforeinstallprompt)
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // Ya rechazó antes → no mostrar por 7 días
        const dismissed = localStorage.getItem('capriccio_install_dismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

        if (ios) {
            // En iOS mostrar instrucciones manuales después de 3s
            const t = setTimeout(() => setVisible(true), 3000);
            return () => clearTimeout(t);
        }

        // Android / Chrome: capturar evento nativo
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setTimeout(() => setVisible(true), 2000);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setVisible(false);
            setIsInstalled(true);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        localStorage.setItem('capriccio_install_dismissed', String(Date.now()));
        setVisible(false);
    };

    if (isInstalled) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 120, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[250]"
                >
                    <div className="bg-[#0f172a] border border-capriccio-gold/30 rounded-3xl p-5 shadow-2xl shadow-black/50">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-capriccio-gold/10 border border-capriccio-gold/20 rounded-2xl flex items-center justify-center shrink-0">
                                <img src="/img/capriccio-logo.png" alt="" className="w-8 h-8 object-contain" />
                            </div>
                            <div className="flex-1 pr-4">
                                <p className="text-white font-black text-sm leading-tight mb-1">
                                    Instala la app de Capriccio
                                </p>
                                {isIOS ? (
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Toca <span className="text-white font-bold">Compartir</span> → <span className="text-white font-bold">Agregar a inicio</span> para instalarla en tu iPhone
                                    </p>
                                ) : (
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Acceso directo desde tu celular, sin abrir el navegador
                                    </p>
                                )}
                            </div>
                        </div>

                        {!isIOS && deferredPrompt && (
                            <button
                                onClick={handleInstall}
                                className="w-full mt-4 bg-capriccio-gold text-[#0f172a] py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all active:scale-95"
                            >
                                <Download size={14} strokeWidth={3} />
                                Instalar Gratis
                            </button>
                        )}

                        {isIOS && (
                            <div className="mt-4 bg-white/5 rounded-2xl p-3 flex items-center gap-3">
                                <Smartphone size={16} className="text-capriccio-gold shrink-0" />
                                <p className="text-slate-400 text-[10px] font-bold leading-relaxed">
                                    Safari → Botón compartir (⎙) → "Añadir a pantalla de inicio"
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
