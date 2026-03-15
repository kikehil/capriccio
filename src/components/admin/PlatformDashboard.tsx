'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Edit2, Trash2, X, Save, CheckCircle2, XCircle, Crown, Star, Zap, Users, TrendingUp, AlertTriangle, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/socket';

interface Negocio {
    id: number;
    nombre: string;
    propietario: string;
    email: string;
    telefono: string;
    ciudad: string;
    plan: 'basico' | 'profesional' | 'premium';
    activo: number;
    fecha_alta: string;
    fecha_vencimiento: string | null;
    notas: string;
}

const PLANES = {
    basico: {
        label: 'Básico',
        color: 'bg-slate-100 text-slate-600 border-slate-200',
        headerColor: 'bg-slate-700',
        icon: <Zap size={14} />,
        features: ['Menú en línea', 'Pedidos básicos', 'Sin módulo cocina', 'Sin módulo reparto']
    },
    profesional: {
        label: 'Profesional',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        headerColor: 'bg-blue-700',
        icon: <Star size={14} />,
        features: ['Todo lo básico', 'Módulo cocina', 'Módulo reparto', 'Promos ilimitadas']
    },
    premium: {
        label: 'Premium',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        headerColor: 'bg-gradient-to-r from-amber-600 to-yellow-500',
        icon: <Crown size={14} />,
        features: ['Todo lo profesional', 'Soporte prioritario', 'Customización avanzada', 'Reportes avanzados']
    }
};

const EMPTY_FORM = {
    nombre: '', propietario: '', email: '', telefono: '',
    ciudad: '', plan: 'basico' as Negocio['plan'],
    fecha_vencimiento: '', notas: '', activo: 1
};

export default function PlatformDashboard() {
    const [negocios, setNegocios] = useState<Negocio[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState<Partial<Negocio>>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [filterPlan, setFilterPlan] = useState<string>('all');

    const getToken = () => localStorage.getItem('capriccio_token_admin') || '';

    const fetchNegocios = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/platform/negocios`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            setNegocios(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNegocios(); }, []);

    const startEdit = (n: Negocio) => {
        setEditingId(n.id);
        setForm({ ...n, fecha_vencimiento: n.fecha_vencimiento ? n.fecha_vencimiento.split('T')[0] : '' });
        setIsAdding(false);
    };

    const startAdd = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setIsAdding(true);
    };

    const cancel = () => { setEditingId(null); setIsAdding(false); setForm(EMPTY_FORM); };

    const handleSave = async () => {
        if (!form.nombre) { alert('El nombre del negocio es obligatorio'); return; }
        setSaving(true);
        try {
            const url = editingId
                ? `${API_URL}/api/platform/negocios/${editingId}`
                : `${API_URL}/api/platform/negocios`;
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(form)
            });
            if (res.ok) { cancel(); fetchNegocios(); }
            else { const e = await res.json(); alert(e.error || 'Error al guardar'); }
        } catch (e) { alert('Error de conexión'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (!confirm(`¿Eliminar el negocio "${nombre}"? Esta acción no se puede deshacer.`)) return;
        await fetch(`${API_URL}/api/platform/negocios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        fetchNegocios();
    };

    const filtered = negocios.filter(n => {
        const matchSearch = n.nombre.toLowerCase().includes(search.toLowerCase()) ||
            n.ciudad?.toLowerCase().includes(search.toLowerCase()) ||
            n.propietario?.toLowerCase().includes(search.toLowerCase());
        const matchPlan = filterPlan === 'all' || n.plan === filterPlan;
        return matchSearch && matchPlan;
    });

    const stats = {
        total: negocios.length,
        activos: negocios.filter(n => n.activo).length,
        basico: negocios.filter(n => n.plan === 'basico').length,
        profesional: negocios.filter(n => n.plan === 'profesional').length,
        premium: negocios.filter(n => n.plan === 'premium').length,
    };

    const isExpired = (fecha: string | null) => {
        if (!fecha) return false;
        return new Date(fecha) < new Date();
    };

    const isExpiringSoon = (fecha: string | null) => {
        if (!fecha) return false;
        const diff = new Date(fecha).getTime() - Date.now();
        return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // 7 days
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                        Panel de <span className="text-capriccio-gold">Plataforma</span>
                    </h2>
                    <p className="text-slate-400 font-bold italic text-sm mt-1">Gestión de negocios y planes de suscripción</p>
                </div>
                <button
                    onClick={startAdd}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black italic uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg"
                >
                    <Plus size={18} strokeWidth={3} /> Nuevo Negocio
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: <Building2 size={20} />, color: 'bg-slate-900 text-white' },
                    { label: 'Activos', value: stats.activos, icon: <CheckCircle2 size={20} />, color: 'bg-green-500 text-white' },
                    { label: 'Básico', value: stats.basico, icon: <Zap size={20} />, color: 'bg-slate-100 text-slate-700' },
                    { label: 'Profesional', value: stats.profesional, icon: <Star size={20} />, color: 'bg-blue-500 text-white' },
                    { label: 'Premium', value: stats.premium, icon: <Crown size={20} />, color: 'bg-amber-500 text-white' },
                ].map((s, i) => (
                    <div key={i} className={cn('p-4 rounded-2xl flex items-center gap-3 shadow-sm', s.color)}>
                        <div className="opacity-80">{s.icon}</div>
                        <div>
                            <p className="text-2xl font-black leading-none">{s.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, ciudad o propietario..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm outline-none focus:border-capriccio-gold transition-all"
                    />
                </div>
                <select
                    value={filterPlan}
                    onChange={e => setFilterPlan(e.target.value)}
                    className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-black text-sm outline-none focus:border-capriccio-gold transition-all"
                >
                    <option value="all">Todos los planes</option>
                    <option value="basico">Básico</option>
                    <option value="profesional">Profesional</option>
                    <option value="premium">Premium</option>
                </select>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {(isAdding || editingId !== null) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white border-2 border-slate-900 rounded-[2rem] p-8 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black uppercase italic tracking-widest text-slate-900">
                                {editingId ? '✏️ Editando Negocio' : '🆕 Nuevo Negocio'}
                            </h3>
                            <button onClick={cancel} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={22} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'nombre', placeholder: 'Nombre del negocio *', required: true },
                                { key: 'propietario', placeholder: 'Nombre del propietario' },
                                { key: 'email', placeholder: 'Email de contacto', type: 'email' },
                                { key: 'telefono', placeholder: 'Teléfono' },
                                { key: 'ciudad', placeholder: 'Ciudad, Estado' },
                                { key: 'fecha_vencimiento', placeholder: 'Fecha vencimiento', type: 'date' },
                            ].map(({ key, placeholder, type = 'text' }) => (
                                <input
                                    key={key}
                                    type={type}
                                    placeholder={placeholder}
                                    value={(form as any)[key] || ''}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    className="w-full bg-slate-50 text-slate-900 p-4 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-slate-900/20 transition-all"
                                />
                            ))}

                            <select
                                value={form.plan}
                                onChange={e => setForm(f => ({ ...f, plan: e.target.value as Negocio['plan'] }))}
                                className="bg-slate-50 text-slate-900 p-4 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:border-slate-900/20 transition-all"
                            >
                                <option value="basico">Plan Básico</option>
                                <option value="profesional">Plan Profesional</option>
                                <option value="premium">Plan Premium</option>
                            </select>

                            {editingId && (
                                <select
                                    value={form.activo}
                                    onChange={e => setForm(f => ({ ...f, activo: Number(e.target.value) }))}
                                    className="bg-slate-50 text-slate-900 p-4 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:border-slate-900/20 transition-all"
                                >
                                    <option value={1}>✅ Activo</option>
                                    <option value={0}>❌ Inactivo</option>
                                </select>
                            )}

                            <textarea
                                placeholder="Notas adicionales..."
                                rows={3}
                                value={form.notas || ''}
                                onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                                className="md:col-span-2 bg-slate-50 text-slate-900 p-4 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-slate-900/20 transition-all resize-none"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="mt-6 w-full bg-slate-950 text-white py-4 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? 'Guardando...' : 'Guardar Negocio'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table */}
            {loading ? (
                <div className="py-20 text-center text-slate-400 font-black italic uppercase animate-pulse tracking-widest">Cargando negocios...</div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-16 text-center">
                    <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-300 font-black italic uppercase tracking-widest">No hay negocios registrados</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100">
                    {/* Table header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50 border-b border-slate-100">
                        {['Negocio', 'Propietario', 'Ciudad', 'Plan', 'Vencimiento', 'Estado', 'Acciones'].map(h => (
                            <div key={h} className={cn('text-[10px] font-black uppercase tracking-widest text-slate-400',
                                h === 'Negocio' ? 'col-span-2' : h === 'Acciones' ? 'col-span-2 text-right' : 'col-span-2'
                            )}>{h}</div>
                        ))}
                    </div>

                    <div className="divide-y divide-slate-50">
                        {filtered.map((n, i) => {
                            const plan = PLANES[n.plan] || PLANES.basico;
                            const expired = isExpired(n.fecha_vencimiento);
                            const expiringSoon = isExpiringSoon(n.fecha_vencimiento);

                            return (
                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className={cn(
                                        'grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-slate-50/50 transition-colors',
                                        !n.activo && 'opacity-50'
                                    )}
                                >
                                    {/* Nombre */}
                                    <div className="md:col-span-2">
                                        <p className="font-black italic text-slate-900 uppercase leading-tight">{n.nombre}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{n.email}</p>
                                    </div>

                                    {/* Propietario */}
                                    <div className="md:col-span-2">
                                        <p className="font-bold text-slate-700 text-sm">{n.propietario || '—'}</p>
                                        <p className="text-[10px] text-slate-400">{n.telefono || ''}</p>
                                    </div>

                                    {/* Ciudad */}
                                    <div className="md:col-span-2">
                                        <p className="font-bold text-slate-700 text-sm">{n.ciudad || '—'}</p>
                                    </div>

                                    {/* Plan */}
                                    <div className="md:col-span-2">
                                        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border', plan.color)}>
                                            {plan.icon} {plan.label}
                                        </span>
                                    </div>

                                    {/* Vencimiento */}
                                    <div className="md:col-span-2">
                                        {n.fecha_vencimiento ? (
                                            <div className="flex items-center gap-1.5">
                                                {expired && <AlertTriangle size={12} className="text-red-500" />}
                                                {expiringSoon && !expired && <AlertTriangle size={12} className="text-amber-500" />}
                                                <span className={cn('text-xs font-bold',
                                                    expired ? 'text-red-500' : expiringSoon ? 'text-amber-600' : 'text-slate-500'
                                                )}>
                                                    {new Date(n.fecha_vencimiento).toLocaleDateString('es-MX')}
                                                    {expired && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black">VENCIDO</span>}
                                                    {expiringSoon && !expired && <span className="ml-1 text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-black">PRONTO</span>}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-300 font-bold">Sin vencimiento</span>
                                        )}
                                    </div>

                                    {/* Estado */}
                                    <div className="md:col-span-1">
                                        {n.activo ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-xl border border-green-100">
                                                <CheckCircle2 size={10} /> Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-xl border border-slate-100">
                                                <XCircle size={10} /> Inactivo
                                            </span>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="md:col-span-1 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => startEdit(n)}
                                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(n.id, n.nombre)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Plan Feature Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {(Object.entries(PLANES) as [Negocio['plan'], typeof PLANES.basico][]).map(([key, plan]) => (
                    <div key={key} className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100">
                        <div className={cn('p-5 text-white', plan.headerColor)}>
                            <div className="flex items-center gap-2">
                                {plan.icon}
                                <span className="font-black uppercase tracking-widest text-sm">Plan {plan.label}</span>
                            </div>
                            <p className="text-3xl font-black italic mt-2">
                                {key === 'basico' ? stats.basico : key === 'profesional' ? stats.profesional : stats.premium}
                                <span className="text-sm font-bold opacity-70 ml-1">negocios</span>
                            </p>
                        </div>
                        <ul className="p-5 space-y-2">
                            {plan.features.map(f => (
                                <li key={f} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                    <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
