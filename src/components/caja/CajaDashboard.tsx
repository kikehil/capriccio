'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Eye, BarChart3, LogOut, Search } from 'lucide-react';
import NewOrderForm from './NewOrderForm';
import ActiveOrdersList from './ActiveOrdersList';
import CashRegisterPanel from './CashRegisterPanel';
import ShiftReportModal from './ShiftReportModal';
import BuscarPedidoModal from './BuscarPedidoModal';
import { CajaTurno } from '@/data/caja-types';
import { API_URL } from '@/lib/socket';

interface TabConfig {
  id: 'nuevo' | 'ordenes' | 'caja' | 'cerrar';
  label: string;
  icon: React.ReactNode;
}

const tabs: TabConfig[] = [
  { id: 'nuevo', label: 'Nuevo Pedido', icon: <Plus size={20} /> },
  { id: 'ordenes', label: 'Órdenes Activas', icon: <Eye size={20} /> },
  { id: 'caja', label: 'Caja & Reportes', icon: <BarChart3 size={20} /> },
  { id: 'cerrar', label: 'Cerrar Turno', icon: <Clock size={20} /> },
];

interface CajaDashboardProps {
  turno: CajaTurno | null;
  onTurnoCreated: (turno: CajaTurno) => void;
  onLogout: () => void;
}

const CajaDashboard: React.FC<CajaDashboardProps> = ({ turno, onTurnoCreated, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'nuevo' | 'ordenes' | 'caja' | 'cerrar'>('nuevo');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showBuscarModal, setShowBuscarModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenShift = async (efectivo_inicial: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/caja/turno/abrir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('capriccio_token_caja')}`
        },
        body: JSON.stringify({ efectivo_inicial })
      });

      if (!response.ok) throw new Error('Error al abrir turno');
      const newTurno = await response.json();
      onTurnoCreated(newTurno);
      setActiveTab('nuevo');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al abrir turno');
    } finally {
      setLoading(false);
    }
  };

  if (!turno) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Clock className="mx-auto text-red-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800">Iniciar Turno</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Efectivo Inicial ($)
              </label>
              <input
                type="number"
                id="efectivo_inicial"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Ej: 50000"
                defaultValue="0"
              />
              <p className="text-xs text-gray-500 mt-1">Dinero para dar cambio (caja chica)</p>
            </div>

            <button
              onClick={() => {
                const value = (document.getElementById('efectivo_inicial') as HTMLInputElement)?.value || '0';
                handleOpenShift(parseFloat(value));
              }}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
            >
              {loading ? 'Abriendo...' : 'Abrir Turno'}
            </button>

            <button
              onClick={onLogout}
              className="w-full text-red-600 font-semibold py-2 border border-red-600 rounded-lg hover:bg-red-50 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER — single bar: tabs left + info right */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 flex items-stretch">
        {/* NAV TABS */}
        <div className="flex items-stretch overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-6 py-3 font-bold text-sm transition whitespace-nowrap border-r border-gray-200 ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* SPACER */}
        <div className="flex-1" />

        {/* BRAND + INFO + BUSCAR + LOGOUT */}
        <div className="flex items-center gap-3 px-4 border-l border-gray-200">
          <img src="/logohd.png" alt="Capriccio" className="h-8 w-auto" />
          <div>
            <p className="text-base font-bold text-gray-800 leading-tight">POS Capriccio</p>
            <p className="text-xs text-gray-500 leading-tight">
              Cajero: <span className="font-semibold text-gray-700">{turno.cajero_nombre}</span>
              {' • '}Hora: <span className="font-mono text-red-600">{currentTime}</span>
            </p>
          </div>
          {/* BOTÓN BUSCAR PEDIDO */}
          <button
            onClick={() => setShowBuscarModal(true)}
            className="flex items-center gap-2 ml-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition text-sm"
          >
            <Search size={16} />
            Buscar Pedido
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Nuevo Pedido Tab */}
        {activeTab === 'nuevo' && <NewOrderForm turno={turno} />}

        {/* Órdenes Activas Tab */}
        {activeTab === 'ordenes' && <ActiveOrdersList turno={turno} />}

        {/* Caja & Reportes Tab */}
        {activeTab === 'caja' && <CashRegisterPanel turno={turno} />}

        {/* Cerrar Turno Tab */}
        {activeTab === 'cerrar' && (
          <button
            onClick={() => setShowShiftModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg"
          >
            Abrir Reporte de Cierre
          </button>
        )}
      </div>

      {/* SHIFT REPORT MODAL */}
      {showShiftModal && (
        <ShiftReportModal turno={turno} onClose={() => setShowShiftModal(false)} />
      )}

      {/* BUSCAR PEDIDO MODAL */}
      {showBuscarModal && (
        <BuscarPedidoModal turno={turno} onClose={() => setShowBuscarModal(false)} />
      )}
    </div>
  );
};

export default CajaDashboard;
