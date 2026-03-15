'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, Plus, Edit2, Save, X, Image as ImageIcon, Tag, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL, getSocket } from '@/lib/socket';

interface Promotion {
    id: number;
    titulo: string;
    subtitulo: string;
    precio: number | string;
    color: string;
    imagen: string;
    badge: string;
}

const EMPTY_FORM = {
    titulo: '',
    subtitulo: '',
    precio: '' as string | number,
    color: 'from-capriccio-accent to-capriccio-gold',
    imagen: '',
    badge: 'NUEVA PROMO'
};

const PromotionManager = () => {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Promotion>>(EMPTY_FORM);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPromos = async () => {
        try {
            const res = await fetch(`${API_URL}/api/promos`);
            const data = await res.json();
            setPromos(Array.isArray(data) ? data : []);
            setIsLoading(false);
        } catch (e) {
            console.error("Error fetching promos:", e);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
        const socket = getSocket();
        if (socket) {
            socket.on('promos_actualizadas', (updatedPromos: Promotion[]) => {
                setPromos(updatedPromos);
            });
            return () => { socket.off('promos_actualizadas'); };
        }
    }, []);

    const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setEditForm(f => ({ ...f, imagen: base64 }));
            setImagePreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!editForm.titulo) {
            alert('El título es obligatorio');
            return;
        }
        setIsSaving(true);
        const id = editingId;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/api/promos/${id}` : `${API_URL}/api/promos`;

        try {
            const token = localStorage.getItem('capriccio_token_admin');
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setEditingId(null);
                setIsAdding(false);
                setEditForm(EMPTY_FORM);
                setImagePreview('');
                fetchPromos();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || 'No se pudo guardar'}`);
            }
        } catch (e) {
            console.error("Error saving promo:", e);
            alert('Error de conexión con el servidor');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro que quieres eliminar esta promoción?')) return;
        try {
            const token = localStorage.getItem('capriccio_token_admin');
            await fetch(`${API_URL}/api/promos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchPromos();
        } catch (e) { console.error("Error deleting promo:", e); }
    };

    const startEdit = (promo: Promotion) => {
        setEditingId(promo.id);
        setEditForm(promo);
        setImagePreview(promo.imagen || '');
        setIsAdding(false);
    };

    const startAdd = () => {
        setEditingId(null);
        setEditForm(EMPTY_FORM);
        setImagePreview('');
        setIsAdding(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsAdding(false);
        setEditForm(EMPTY_FORM);
        setImagePreview('');
    };

    if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest">Cargando Módulo de Promociones...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-2">Editor de Promociones</h2>
                    <p className="text-slate-400 font-bold italic text-sm">Gestiona los anuncios y combos del carrusel principal.</p>
                </div>
                <button
                    onClick={startAdd}
                    className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black italic uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center gap-3"
                >
                    <Plus size={20} strokeWidth={3} />
                    Nueva Promo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {(isAdding || editingId !== null) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-slate-900 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <button onClick={cancelEdit} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">{editingId ? 'Editando Promo' : 'Nueva Promo'}</h3>

                            <div className="space-y-4">
                                {/* Image Upload */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-36 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <Upload size={28} className="text-slate-300 mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subir Imagen</p>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                                        <span className="bg-white/80 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Cambiar foto</span>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageFile}
                                />

                                <input
                                    placeholder="TÍTULO (Ej: COMBO 2X1)"
                                    className="w-full bg-slate-50 text-slate-900 p-4 rounded-2xl font-black italic uppercase outline-none border-2 border-transparent focus:border-slate-900/20 transition-all"
                                    value={editForm.titulo || ''}
                                    onChange={e => setEditForm({ ...editForm, titulo: e.target.value.toUpperCase() })}
                                />
                                <input
                                    placeholder="SUBTÍTULO"
                                    className="w-full bg-slate-50 text-slate-900 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-slate-900/20 transition-all text-sm"
                                    value={editForm.subtitulo || ''}
                                    onChange={e => setEditForm({ ...editForm, subtitulo: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        placeholder="PRECIO / BOTÓN"
                                        className="w-full bg-slate-50 text-slate-900 p-4 rounded-2xl font-black italic outline-none border-2 border-transparent focus:border-slate-900/20 transition-all text-sm"
                                        value={editForm.precio as string || ''}
                                        onChange={e => setEditForm({ ...editForm, precio: e.target.value })}
                                    />
                                    <input
                                        placeholder="BADGE"
                                        className="w-full bg-slate-50 text-slate-900 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none border-2 border-transparent focus:border-slate-900/20 transition-all"
                                        value={editForm.badge || ''}
                                        onChange={e => setEditForm({ ...editForm, badge: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <select
                                    className="w-full bg-slate-50 text-slate-900 p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] outline-none border-2 border-transparent focus:border-slate-900/20 transition-all"
                                    value={editForm.color || ''}
                                    onChange={e => setEditForm({ ...editForm, color: e.target.value })}
                                >
                                    <option value="from-capriccio-accent to-capriccio-gold">Capriccio Clásico</option>
                                    <option value="from-slate-950 to-slate-800">Nocturno Dark</option>
                                    <option value="from-red-600 to-red-900">Pasión Pizza</option>
                                    <option value="from-emerald-600 to-teal-900">Eco Fresh</option>
                                    <option value="from-blue-600 to-indigo-900">Vip Blue</option>
                                </select>

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={20} />
                                    {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {promos.map((promo) => (
                        <motion.div
                            key={promo.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="relative h-48 overflow-hidden">
                                {promo.imagen ? (
                                    <img src={promo.imagen} alt={promo.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className={cn("absolute inset-0 bg-gradient-to-br", promo.color)} />
                                )}
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", promo.color)} />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                                        {promo.badge}
                                    </span>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm gap-4">
                                    <button
                                        onClick={() => startEdit(promo)}
                                        className="bg-white text-slate-900 p-4 rounded-2xl shadow-xl hover:bg-capriccio-gold transition-colors active:scale-90"
                                    >
                                        <Edit2 size={24} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo.id)}
                                        className="bg-red-600 text-white p-4 rounded-2xl shadow-xl hover:bg-red-700 transition-colors active:scale-90"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8">
                                <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 mb-1">{promo.titulo}</h4>
                                <p className="text-sm font-bold text-slate-400 mb-4">{promo.subtitulo}</p>
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-lg font-black italic text-slate-900">
                                        {typeof promo.precio === 'number' ? `$${promo.precio}` : promo.precio}
                                    </p>
                                    <Tag className="text-slate-300" size={16} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {promos.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem]">
                        <Sparkles size={40} className="opacity-20 mb-4" />
                        <p className="font-black italic uppercase tracking-widest text-sm opacity-30">No hay promociones activas</p>
                        <p className="text-xs text-slate-300 mt-2 opacity-30">Haz click en "Nueva Promo" para crear la primera</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionManager;
