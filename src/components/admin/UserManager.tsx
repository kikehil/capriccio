'use client';

import React, { useState, useEffect } from 'react';
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
            const token = localStorage.getItem('token');
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
        const token = localStorage.getItem('token');
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
        const token = localStorage.getItem('token');
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
            case 'admin': return <Shield className="w-4 h-4 text-purple-400" />;
            case 'cocina': return <ChefHat className="w-4 h-4 text-blue-400" />;
            case 'repartidor': return <Truck className="w-4 h-4 text-capriccio-gold" />;
            default: return <Users className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="text-capriccio-gold" />
                        Gestión de Usuarios y Repartidores
                    </h2>
                    <p className="text-gray-400">Administra el acceso del personal al sistema.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-capriccio-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                >
                    <UserPlus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            <div className="flex bg-capriccio-dark/50 p-2 rounded-xl border border-white/5 max-w-md">
                <Search className="text-gray-500 ml-2 mt-2" />
                <input
                    type="text"
                    placeholder="Buscar por usuario o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-white focus:ring-0 w-full px-3 py-2 outline-none"
                />
            </div>

            <div className="bg-capriccio-dark/50 rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 text-sm uppercase">
                            <th className="px-6 py-4 font-semibold">Usuario / Nombre</th>
                            <th className="px-6 py-4 font-semibold">Rol</th>
                            <th className="px-6 py-4 font-semibold">Estado</th>
                            <th className="px-6 py-4 font-semibold">Fecha Registro</th>
                            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{u.username}</div>
                                    <div className="text-xs text-gray-500">{u.nombre_completo}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit">
                                        {getRoleIcon(u.role)}
                                        <span className="text-sm capitalize text-gray-300">{u.role}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {u.activo ? (
                                        <span className="flex items-center gap-1 text-green-400 text-xs font-bold">
                                            <Check className="w-3 h-3" /> ACTIVO
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                                            <X className="w-3 h-3" /> INACTIVO
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(u)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(u.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && !loading && (
                    <div className="p-12 text-center text-gray-500">
                        No se encontraron usuarios.
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-capriccio-dark border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                {editingUser ? <Edit2 className="text-blue-400" /> : <UserPlus className="text-capriccio-gold" />}
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                                <X />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400">Usuario (Login)</label>
                                <input
                                    required
                                    value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-capriccio-gold outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400">Nombre Completo</label>
                                <input
                                    required
                                    value={form.nombre_completo}
                                    onChange={e => setForm({ ...form, nombre_completo: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-capriccio-gold outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400">Contraseña {editingUser && '(Dejar vacío para no cambiar)'}</label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-capriccio-gold outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400">Rol</label>
                                    <select
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-capriccio-gold outline-none"
                                    >
                                        <option value="repartidor">Repartidor</option>
                                        <option value="cocina">Cocina</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400">Estado</label>
                                    <div className="flex items-center gap-2 mt-3">
                                        <input
                                            type="checkbox"
                                            checked={form.activo}
                                            onChange={e => setForm({ ...form, activo: e.target.checked })}
                                            className="w-5 h-5 rounded border-white/10 bg-white/5 text-capriccio-gold focus:ring-capriccio-gold"
                                        />
                                        <span className="text-gray-300">Activo</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-white/5 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-capriccio-gold text-black py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
