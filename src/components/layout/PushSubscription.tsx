'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X } from 'lucide-react';
import { API_URL } from '@/lib/socket';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

interface Props {
    token: string;
}

export default function PushSubscription({ token }: Props) {
    const [status, setStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported'>('idle');
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setStatus('unsupported'); return;
        }
        const perm = Notification.permission;
        if (perm === 'granted') {
            checkSubscription(); return;
        }
        if (perm === 'denied') {
            setStatus('denied'); return;
        }
        // Solo mostrar si no ha respondido antes
        const dismissed = localStorage.getItem('capriccio_push_dismissed');
        if (!dismissed) setTimeout(() => setVisible(true), 4000);
    }, []);

    const checkSubscription = async () => {
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            setStatus(sub ? 'subscribed' : 'idle');
        } catch { setStatus('idle'); }
    };

    const subscribe = async () => {
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
            const { endpoint, keys } = sub.toJSON() as any;
            await fetch(`${API_URL}/api/push/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth }),
            });
            setStatus('subscribed');
            setVisible(false);
        } catch (e) {
            if (Notification.permission === 'denied') setStatus('denied');
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch(`${API_URL}/api/push/unsubscribe`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            setStatus('idle');
        } catch { }
    };

    const dismiss = () => {
        localStorage.setItem('capriccio_push_dismissed', '1');
        setVisible(false);
    };

    if (status === 'unsupported') return null;

    return (
        <>
            {/* Banner de solicitud de permiso */}
            <AnimatePresence>
                {visible && status === 'idle' && (
                    <motion.div
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -80, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="fixed top-0 left-0 right-0 z-[400] bg-[#0f172a] border-b border-capriccio-gold/20 px-4 py-3 shadow-2xl"
                    >
                        <div className="max-w-2xl mx-auto flex items-center gap-3">
                            <div className="w-9 h-9 bg-capriccio-gold/10 rounded-xl flex items-center justify-center shrink-0">
                                <Bell size={16} className="text-capriccio-gold" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-black text-sm leading-none mb-0.5">
                                    Activa las notificaciones
                                </p>
                                <p className="text-slate-400 text-xs font-medium truncate">
                                    Recibe avisos cuando tu pizza esté lista o en camino 🛵
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={subscribe}
                                    disabled={loading}
                                    className="bg-capriccio-gold text-[#0f172a] px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50"
                                >
                                    {loading ? '...' : 'Activar'}
                                </button>
                                <button onClick={dismiss} className="text-slate-500 hover:text-white transition-colors p-1">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Botón de estado en perfil (solo visible para usuario logueado) */}
            {status === 'subscribed' && (
                <button
                    onClick={unsubscribe}
                    title="Desactivar notificaciones"
                    className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 hover:text-red-400 transition-colors uppercase tracking-wide px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                    <Bell size={11} fill="currentColor" /> Notificaciones activas
                </button>
            )}
            {status === 'denied' && (
                <p className="text-[10px] text-slate-400 font-bold px-3 py-1.5 flex items-center gap-1.5">
                    <BellOff size={11} /> Notificaciones bloqueadas en tu navegador
                </p>
            )}
        </>
    );
}
