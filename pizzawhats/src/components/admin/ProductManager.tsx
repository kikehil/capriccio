'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pizza } from '@/data/menu';
import { Edit2, Trash2, Plus, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductManagerProps {
    products: Pizza[];
    onUpdate: (id: number, updates: Partial<Pizza>) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, onUpdate }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-1">Gestión de Menú</h3>
                    <p className="text-slate-400 font-bold italic text-sm">Controla la disponibilidad en tiempo real.</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-sm transition-all"
                        />
                    </div>
                    <button className="bg-red-600 text-white p-3 rounded-2xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95">
                        <Plus size={24} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map(product => (
                            <motion.div
                                layout
                                key={product.id}
                                className="p-6 flex flex-col sm:flex-row items-center justify-between hover:bg-slate-50/50 transition-colors gap-6"
                            >
                                <div className="flex items-center gap-6 w-full sm:w-auto">
                                    <div className="relative group overflow-hidden rounded-2xl">
                                        <img
                                            src={product.imagen}
                                            className={cn(
                                                "w-20 h-20 object-cover transition-all duration-500",
                                                !product.activo && "grayscale brightness-50"
                                            )}
                                            alt={product.nombre}
                                        />
                                        {!product.activo && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="bg-white/90 text-black text-[8px] font-black uppercase px-2 py-1 rounded-full italic shadow-sm">Agotado</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-red-600 opacity-60">{product.categoria}</span>
                                        </div>
                                        <p className="font-black text-xl italic text-slate-900 uppercase leading-none mb-1">{product.nombre}</p>
                                        <p className="text-lg font-black text-slate-400 italic leading-none">${product.precio}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full sm:w-auto gap-8 sm:gap-12">
                                    {/* Availability Switch */}
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={product.activo}
                                                onChange={() => onUpdate(product.id, { activo: !product.activo })}
                                            />
                                            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 transition-colors"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-950 transition-all">
                                            <Edit2 size={20} />
                                        </button>
                                        <button className="p-3 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredProducts.length === 0 && (
                        <div className="p-20 text-center">
                            <p className="text-slate-300 font-black italic uppercase text-2xl">No se encontraron productos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductManager;
