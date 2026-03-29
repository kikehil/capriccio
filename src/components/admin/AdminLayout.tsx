'use client';

import React from 'react';
import { Package, Flame, BarChart3, Settings, LayoutDashboard, Menu, X, FileText, Users, DollarSign, LogOut, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: 'stats' | 'products' | 'promos' | 'settings' | 'reports' | 'users' | 'corte' | 'platform' | 'dashboard';
    setActiveTab: (tab: any) => void;
    plan?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, setActiveTab, plan = 'basico' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, capriccio_only: true },
        { id: 'stats', label: 'Pedidos', icon: LayoutDashboard },
        { id: 'corte', label: 'Corte de Caja', icon: DollarSign },
        { id: 'products', label: 'Productos', icon: Package },
        { id: 'users', label: 'Usuarios', icon: Users },
        { id: 'reports', label: 'Reportes', icon: FileText },
        { id: 'promos', label: 'Promociones', icon: Flame },
        { id: 'settings', label: 'Configuración', icon: Settings },
        { id: 'platform', label: 'Plataforma', icon: LayoutDashboard, super_only: true },
    ].filter(item => {
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('capriccio_user_role') : '';
        const username = typeof window !== 'undefined' ? localStorage.getItem('capriccio_username') : '';
        const businessName = typeof window !== 'undefined' ? localStorage.getItem('capriccio_negocio_nombre') : '';

        // 1. SUPER ADMIN (platform)
        if (userRole === 'platform' || businessName === 'Admin Demo') {
            return item.id === 'platform';
        }
        if (item.id === 'platform') return false;

        // 2. Dashboard Analytics — solo para usuario capriccio
        if (item.id === 'dashboard') return username === 'capriccio';

        // 2b. Usuario capriccio tiene acceso completo a todo (sin importar el plan)
        if (username === 'capriccio') return true;

        // 3. ROL CAJA — solo ve Pedidos
        if (userRole === 'caja') return item.id === 'stats';

        // 4. ROL RESPONSABLE — solo ve Pedidos
        if (userRole === 'responsable') return item.id === 'stats';

        // 5. ROL MARKETING — solo Productos y Promociones
        if (userRole === 'marketing') return ['products', 'promos'].includes(item.id);

        // 6. ADMIN NORMAL — filtro por plan
        if (plan === 'basico') return ['stats', 'products', 'promos'].includes(item.id);

        return true;
    });

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed top-4 left-4 z-[110] md:hidden p-3 bg-slate-900 text-white rounded-2xl shadow-xl"
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-[100] w-72 bg-slate-950 text-white p-8 transition-transform duration-300 transform md:translate-x-0 md:static",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col items-center mb-12">
                    <img src="/logohd.png" alt="Logo" className="w-40 h-auto drop-shadow-xl mb-4" />
                    <span className="text-capriccio-gold text-xs font-black tracking-[0.3em] border-y border-capriccio-gold/20 py-1">Panel Admin v2</span>
                </div>

                <nav className="space-y-3">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id as any);
                                setIsSidebarOpen(false);
                            }}
                            className={cn(
                                "flex items-center gap-4 w-full p-4 rounded-2xl font-bold transition-all group",
                                activeTab === item.id
                                    ? "bg-capriccio-gold text-capriccio-dark shadow-lg shadow-capriccio-gold/20"
                                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                            )}
                        >
                            <item.icon size={20} className={cn(
                                "transition-transform group-hover:scale-110",
                                activeTab === item.id ? "text-capriccio-dark" : "text-slate-600"
                            )} />
                            <span className="tracking-widest text-xs font-bold">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-8 right-8 space-y-3">
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-black tracking-[0.3em] text-slate-500 mb-2">Usuario</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-capriccio-gold rounded-lg flex items-center justify-center text-capriccio-dark font-black text-xs italic">
                                {(typeof window !== 'undefined' && localStorage.getItem('capriccio_negocio_nombre')?.charAt(0)) || 'C'}
                            </div>
                            <p className="font-bold text-sm text-slate-300">
                                {typeof window !== 'undefined' ? localStorage.getItem('capriccio_negocio_nombre') : 'Admin Capriccio'}
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all group"
                    >
                        <LogOut size={18} className="transition-transform group-hover:scale-110" />
                        <span className="text-xs tracking-widest font-black italic">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 md:pt-12 overflow-y-auto w-full">
                {children}
            </main>

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                />
            )}
        </div>
    );
};

export default AdminLayout;
