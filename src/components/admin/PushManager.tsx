'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, Loader2, CheckCircle, AlertCircle, History, Megaphone } from 'lucide-react';
import { API_URL } from '@/lib/socket';

interface HistorialItem {
    titulo: string;
    cuerpo: string;
    fecha: string;
    total: number;
}

export default function PushManager() {
    const [titulo, setTitulo] = useState('');
    const [cuerpo, setCuerpo] = useState('');
    const [url, setUrl] = useState('/');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
    const [totalSubs, setTotalSubs] = useState<number | null>(null);
    const [historial, setHistorial] = useState<HistorialItem[]>([]);

    // Plantillas rápidas
    const PLANTILLAS = [
        { emoji: '🍕', titulo: '¡Hoy hay promoción!', cuerpo: '2 pizzas medianas + refresco 2L a precio especial. Solo por hoy.' },
        { emoji: '🔥', titulo: '¡Viernes de 2x1!', cuerpo: 'Este viernes todas las pizzas medianas al 2x1. No te lo pierdas.' },
        { emoji: '🎉', titulo: '¡Nueva pizza en el menú!', cuerpo: 'Probá nuestra nueva creación. Disponible ya para pedido en línea.' },
        { emoji: '⏰', titulo: '¿Se te antoja una pizza?', cuerpo: 'Estamos abiertos y listos para tu pedido. Pide ahora y la llevamos a tu puerta.' },
    ];

    useEffect(() => {
        fetchStats();
        // Cargar historial del localStorage
        const saved = localStorage.getItem('capriccio_push_historial');
        if (saved) setHistorial(JSON.parse(saved));
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('capriccio_token_admin');
            const res = await fetch(`${API_URL}/api/push/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTotalSubs(data.total);
            }
        } catch { }
    };

    const handleSend = async () => {
        if (!titulo.trim() || !cuerpo.trim()) return;
        setSending(true);
        setResult(null);
        try {
            const token = localStorage.getItem('capriccio_token_admin');
            const res = await fetch(`${API_URL}/api/push/promo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ titulo: titulo.trim(), cuerpo: cuerpo.trim(), url }),
            });
            const data = await res.json();
            if (res.ok) {
                setResult({ ok: true, msg: data.mensaje || '¡Notificación enviada!' });
                // Guardar en historial local
                const item: HistorialItem = {
                    titulo: titulo.trim(),
                    cuerpo: cuerpo.trim(),
                    fecha: new Date().toISOString(),
                    total: totalSubs || 0,
                };
                const updated = [item, ...historial].slice(0, 20);
                setHistorial(updated);
                localStorage.setItem('capriccio_push_historial', JSON.stringify(updated));
                setTitulo('');
                setCuerpo('');
                setUrl('/');
            } else {
                setResult({ ok: false, msg: data.error || 'Error al enviar' });
            }
        } catch {
            setResult({ ok: false, msg: 'Error de conexión' });
        } finally {
            setSending(false);
            setTimeout(() => setResult(null), 5000);
        }
    };

    const usePlantilla = (p: typeof PLANTILLAS[0]) => {
        setTitulo(`${p.emoji} ${p.titulo}`);
        setCuerpo(p.cuerpo);
    };

    const formatFecha = (iso: string) => {
        try {
            return new Date(iso).toLocaleString('es-MX', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            });
        } catch { return iso; }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                        Notificaciones Push
                    </h2>
                    <p className="text-slate-400 font-bold text-sm mt-1">
                        Envía mensajes directos al celular de tus clientes
                    </p>
                </div>
                {totalSubs !== null && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl">
                        <Users size={16} className="text-emerald-600" />
                        <span className="font-black text-emerald-700 text-sm">
                            {totalSubs} {totalSubs === 1 ? 'suscriptor' : 'suscriptores'}
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Formulario */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8">

                    {/* Plantillas rápidas */}
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                        Plantillas rápidas
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-8">
                        {PLANTILLAS.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => usePlantilla(p)}
                                className="text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-3 transition-all group"
                            >
                                <span className="text-lg">{p.emoji}</span>
                                <p className="font-bold text-slate-700 text-xs mt-1 group-hover:text-capriccio-gold transition-colors">
                                    {p.titulo}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Campos */}
                    <div className="space-y-5">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2 block">
                                Título de la notificación
                            </label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Ej: 🍕 ¡Hoy hay promoción!"
                                maxLength={60}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-capriccio-gold/40 rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none transition-all"
                            />
                            <p className="text-[10px] text-slate-300 font-bold mt-1 text-right">{titulo.length}/60</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2 block">
                                Mensaje
                            </label>
                            <textarea
                                value={cuerpo}
                                onChange={e => setCuerpo(e.target.value)}
                                placeholder="El texto que verán al recibir la notificación..."
                                maxLength={200}
                                rows={3}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-capriccio-gold/40 rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none transition-all resize-none"
                            />
                            <p className="text-[10px] text-slate-300 font-bold mt-1 text-right">{cuerpo.length}/200</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2 block">
                                URL al hacer clic (opcional)
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="/"
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-capriccio-gold/40 rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    {(titulo || cuerpo) && (
                        <div className="mt-6 bg-slate-900 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">Vista previa</p>
                            <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-md">
                                <img src="/icons/icon-72x72.png" alt="" className="w-10 h-10 rounded-lg" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 text-sm truncate">{titulo || 'Título...'}</p>
                                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{cuerpo || 'Mensaje...'}</p>
                                    <p className="text-slate-300 text-[10px] mt-1">capricciopizzeria.com · ahora</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wide ${result.ok ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                            {result.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {result.msg}
                        </div>
                    )}

                    {/* Botón enviar */}
                    <button
                        onClick={handleSend}
                        disabled={sending || !titulo.trim() || !cuerpo.trim()}
                        className="w-full mt-6 bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-sm italic uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
                    >
                        {sending ? (
                            <><Loader2 size={18} className="animate-spin" /> Enviando...</>
                        ) : (
                            <><Send size={18} /> Enviar a {totalSubs ?? '...'} suscriptores</>
                        )}
                    </button>
                </div>

                {/* Historial */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <History size={16} className="text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Historial</p>
                    </div>

                    {historial.length === 0 ? (
                        <div className="py-12 text-center text-slate-300">
                            <Megaphone size={36} className="mx-auto mb-3 opacity-30" />
                            <p className="font-bold text-sm">Sin envíos aún</p>
                            <p className="text-xs mt-1">Aquí aparecerán tus notificaciones enviadas</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {historial.map((item, i) => (
                                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="font-black text-slate-900 text-xs truncate">{item.titulo}</p>
                                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{item.cuerpo}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] text-slate-300 font-bold">{formatFecha(item.fecha)}</span>
                                        <span className="text-[10px] text-emerald-500 font-black">{item.total} destinatarios</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
