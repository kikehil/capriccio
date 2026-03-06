'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import io from 'socket.io-client';

import AdminLayout from './AdminLayout';
import ProductManager from './ProductManager';
import PromotionManager from './PromotionManager';
import ReportsModule from './ReportsModule';
import UserManager from './UserManager';
import Login from './Login';
import { pizzas as initialPizzas, Pizza } from '@/data/menu';

import { getSocket, API_URL } from '@/lib/socket';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = React.useState<'stats' | 'products' | 'promos' | 'settings' | 'reports' | 'users'>('stats');
    const [products, setProducts] = React.useState<Pizza[]>(initialPizzas);
    const [dailyRevenue, setDailyRevenue] = React.useState(0);
    const [orderCount, setOrderCount] = React.useState(0);
    const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
    const [chartData, setChartData] = React.useState([
        { dia: 'Lun', ventas: 0 },
        { dia: 'Mar', ventas: 0 },
        { dia: 'Mie', ventas: 0 },
        { dia: 'Jue', ventas: 0 },
        { dia: 'Vie', ventas: 0 },
        { dia: 'Sab', ventas: 0 },
        { dia: 'Hoy', ventas: 0 },
    ]);

    React.useEffect(() => {
        const socket = getSocket();

        // Cargar estadísticas reales al entrar
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('capriccio_token_admin');
                const res = await fetch(`${API_URL}/api/admin/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.revenueToday !== undefined) {
                    setDailyRevenue(data.revenueToday);
                    setOrderCount(data.totalOrders || data.orderCount || 0);
                    setRecentOrders(data.recentOrders || []);
                    // Actualizar gráfica
                    setChartData(prev => prev.map(d => d.dia === 'Hoy' ? { ...d, ventas: data.revenueToday } : d));
                }
            } catch (e) {
                console.error("❌ [Admin] Error al cargar estadísticas:", e);
            }
        };

        fetchStats();

        if (!socket) return;

        socket.on('nuevo_pedido', (pedido: any) => {
            console.log("Admin recibiendo pedido:", pedido);
            setDailyRevenue(prev => prev + (pedido.total || 0));
            setOrderCount(prev => prev + 1);
            setRecentOrders(prev => [pedido, ...prev].slice(0, 5));
            setChartData(prev => prev.map(d =>
                d.dia === 'Hoy' ? { ...d, ventas: d.ventas + (pedido.total || 0) } : d
            ));
        });

        // Listen for remote menu updates
        socket.on('menu_actualizado', (updatedProducts: Pizza[]) => {
            setProducts(updatedProducts);
        });

        return () => {
            socket.off('nuevo_pedido');
            socket.off('menu_actualizado');
        };
    }, []);

    const updateProduct = (id: number, updates: Partial<Pizza>) => {
        const newProducts = products.map(p => p.id === id ? { ...p, ...updates } : p);
        setProducts(newProducts);

        // Emit to all clients via Bridge Server
        const socket = getSocket();
        if (socket) socket.emit('actualizar_menu', newProducts);
    };

    /* if (!isAuth) {
        return <Login onLogin={setIsAuth} />;
    } */

    const renderContent = () => {
        if (activeTab === 'products') {
            return <ProductManager products={products} onUpdate={updateProduct} />;
        }
        if (activeTab === 'users') {
            return <UserManager />;
        }
        if (activeTab === 'promos') {
            return <PromotionManager />;
        }

        if (activeTab === 'stats') {
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Chart */}
                        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-50">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black uppercase italic tracking-wider">Flujo de Caja</h3>
                                <div className="flex items-center gap-2">
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">En Vivo</span>
                                </div>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <XAxis
                                            dataKey="dia"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: '#f1f5f9', radius: 10 }}
                                            contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="ventas" radius={[10, 10, 10, 10]} barSize={40}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 6 ? '#dc2626' : '#0f172a'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="space-y-6">
                            <div className="bg-red-600 p-8 rounded-[3rem] shadow-2xl shadow-red-600/30 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                                <p className="text-xs uppercase font-black tracking-[0.3em] opacity-80 mb-2">Ingresos del Día</p>
                                <h4 className="text-6xl font-black italic leading-none transition-all">
                                    ${dailyRevenue.toLocaleString()}
                                </h4>
                                <p className="text-[10px] font-black mt-6 flex items-center gap-2">
                                    <span className="bg-white/20 px-3 py-1 rounded-full tracking-widest uppercase">Actualización Instantánea</span>
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
                                <p className="text-xs uppercase font-black tracking-[0.2em] text-slate-400 mb-6">Eficiencia Operativa</p>
                                <div className="space-y-6">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Promedio</p>
                                        <p className="text-2xl font-black text-slate-900 italic">${orderCount > 0 ? (dailyRevenue / orderCount).toFixed(2) : 0}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos Totales</p>
                                        <p className="text-2xl font-black text-slate-900 italic">{orderCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white">
                            <div className="flex justify-between items-center mb-8">
                                <p className="text-xs uppercase font-black tracking-[0.3em] text-slate-500 font-bold">Últimos Movimientos</p>
                                <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded-lg">LIVE</span>
                            </div>
                            <div className="space-y-4">
                                {recentOrders.length === 0 ? (
                                    <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                        <p className="text-slate-600 font-black italic text-sm uppercase tracking-widest">Esperando órdenes...</p>
                                    </div>
                                ) : (
                                    recentOrders.map((order, idx) => (
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            key={idx}
                                            className="flex justify-between items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-default"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-xs text-yellow-400">#{order.id.split('-')[1] || order.id.slice(-4)}</div>
                                                <div>
                                                    <p className="text-sm font-black italic uppercase leading-none mb-1">{order.items[0].nombre} {order.items.length > 1 && `+${order.items.length - 1}`}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold tracking-widest">{order.timestamp}</p>
                                                </div>
                                            </div>
                                            <p className="text-yellow-400 font-black italic text-lg leading-none">${order.total}</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-xl flex flex-col justify-center items-center text-center">
                            <Flame className="text-red-600 mb-4" size={48} />
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Monitor Alpha 1</h4>
                            <p className="text-slate-400 font-bold italic text-sm max-w-xs">Todos los sistemas operativos. El canal de comunicación con cocina está al 100% de capacidad.</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'reports') {
            return <ReportsModule />;
        }

        return (
            <div className="p-20 text-center">
                <p className="text-slate-300 font-black italic uppercase text-2xl">Módulo en Desarrollo</p>
            </div>
        );
    };

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="animate-in fade-in duration-700">
                {renderContent()}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
