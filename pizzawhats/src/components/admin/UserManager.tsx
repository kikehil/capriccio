'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Trash2, Edit2, Shield, Truck, ChefHat, Check, X, Search } from 'lucide-react';
import { API_URL } from '@/lib/socket';

interface Usuario {
    id: number;
    username: string;
    role: 'admin' | 'cocina' | 'repartidor';
    nombre_completo: string;
    activo: boolean;
    created_at: string;
}

export default function UserManager() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [form, setForm] = useState<{
        username: string;
        password: string;
        role: 'admin' | 'cocina' | 'repartidor';
        nombre_completo: string;
        activo: boolean;
    }>({
        username: '',
        password: '',
        role: 'repartidor',
        nombre_completo: '',
        activo: true
    });

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const token = localStorage.getItem('capriccio_token_admin');
            const res = await fetch(`${API_URL}/api/usuarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsuarios(data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('capriccio_token_admin');
        const method = editingUser ? 'PUT' : 'POST';
        const url = editingUser ? `${API_URL}/api/usuarios/${editingUser.id}` : `${API_URL}/api/usuarios`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                fetchUsuarios();
                setShowModal(false);
                resetForm();
            }
        } catch (err) {
            console.error('Error saving user:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        const token = localStorage.getItem('capriccio_token_admin');
        try {
            const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchUsuarios();
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };

    const resetForm = () => {
        setForm({
            username: '',
            password: '',
            role: 'repartidor',
            nombre_completo: '',
            activo: true
        });
        setEditingUser(null);
    };

    const handleEdit = (u: Usuario) => {
        setEditingUser(u);
        setForm({
            username: u.username,
            password: '', // Password empty when editing
            role: u.role,
            nombre_completo: u.nombre_completo || '',
            activo: u.activo
        });
        setShowModal(true);
    };

    const filteredUsers = usuarios.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4 text-purple-600" />;
            case 'cocina': return <ChefHat className="w-4 h-4 text-blue-600" />;
            case 'repartidor': return <Truck className="w-4 h-4 text-amber-600" />;
            default: return <Users className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
                        <div className="p-3 bg-capriccio-gold rounded-2xl shadow-lg shadow-capriccio-gold/20">
                            <Users className="text-slate-900" size={24} />
                        </div>
                        Gestión de Personal
                    </h2>
                    <p className="text-slate-400 font-bold italic text-sm mt-2">Control de accesos para repartidores, cocina y administración.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black italic uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                >
                    <UserPlus className="w-5 h-5 text-capriccio-gold" />
                    Añadir Usuario
                </button>
            </div>

            {/* Toolbar Section */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por usuario o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-capriccio-gold/20 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-8 py-6">Usuario / Nombre</th>
                                <th className="px-8 py-6 text-center">Rol</th>
                                <th className="px-8 py-6 text-center">Estado</th>
                                <th className="px-8 py-6">Fecha Registro</th>
                                <th className="px-8 py-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-900 italic uppercase">{u.username}</div>
                                        <div className="text-xs text-slate-400 font-bold italic">{u.nombre_completo}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-100 w-fit mx-auto">
                                            {getRoleIcon(u.role)}
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{u.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {u.activo ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> ACTIVO
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> INACTIVO
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-slate-400">
                                            {new Date(u.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => handleEdit(u)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && !loading && (
                    <div className="py-20 text-center space-y-4">
                        <Users className="mx-auto text-slate-100" size={64} />
                        <p className="text-slate-400 font-bold italic">No se han encontrado miembros del personal.</p>
                    </div>
                )}
            </div>

            {/* Modal Update */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                                        {editingUser ? 'Actualizar Miembro' : 'Nuevo Miembro'}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-bold italic">Configura las credenciales de acceso.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white text-slate-400 hover:text-slate-900 shadow-sm transition-all border border-transparent hover:border-slate-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuario (ID Login)</label>
                                        <input
                                            required
                                            value={form.username}
                                            onChange={e => setForm({ ...form, username: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-capriccio-gold/20 transition-all outline-none"
                                            placeholder="ej: juan.perez"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol Operativo</label>
                                        <select
                                            value={form.role}
                                            onChange={e => setForm({ ...form, role: e.target.value as any })}
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-capriccio-gold/20 transition-all outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="repartidor">Repartidor</option>
                                            <option value="cocina">Cocina</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <input
                                        required
                                        value={form.nombre_completo}
                                        onChange={e => setForm({ ...form, nombre_completo: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-capriccio-gold/20 transition-all outline-none"
                                        placeholder="Nombre del personal"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Contraseña {editingUser && '(Dejar vacío para no cambiar)'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-capriccio-gold/20 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            checked={form.activo}
                                            onChange={e => setForm({ ...form, activo: e.target.checked })}
                                            className="w-6 h-6 rounded-lg border-2 border-slate-200 text-capriccio-gold focus:ring-capriccio-gold focus:ring-offset-0 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div className="ml-2 text-sm">
                                        <label className="font-black italic uppercase text-slate-700 tracking-tighter">Acceso Habilitado</label>
                                        <p className="text-[10px] text-slate-400 font-bold">El usuario podrá iniciar sesión en su plataforma correspondiente.</p>
                                    </div>
                                </div>

                                <div className="pt-4 grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="py-5 bg-slate-100 text-slate-500 rounded-2xl font-black italic uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="py-5 bg-slate-900 text-white rounded-2xl font-black italic uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Check className="text-capriccio-gold" size={20} />
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
