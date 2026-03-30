'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { CajaTurno } from '@/data/caja-types';

interface CashRegisterStats {
  total_ordenes: number;
  total_efectivo: number;
  total_tarjeta: number;
  total_ingresos: number;
}

interface CashRegisterPanelProps {
  turno: CajaTurno;
}

const CashRegisterPanel: React.FC<CashRegisterPanelProps> = ({ turno }) => {
  const [stats, setStats] = useState<CashRegisterStats>({
    total_ordenes: 0,
    total_efectivo: 0,
    total_tarjeta: 0,
    total_ingresos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refrescar cada 10 segundos
    return () => clearInterval(interval);
  }, [turno.id]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/caja/reporte/turno/${turno.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('capriccio_token_caja')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const resumen = data.resumen;
        setStats({
          total_ordenes: resumen.total_ordenes || 0,
          total_efectivo: resumen.total_efectivo || 0,
          total_tarjeta: resumen.total_tarjeta || 0,
          total_ingresos: (resumen.total_efectivo || 0) + (resumen.total_tarjeta || 0),
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Cargando datos...</div>;
  }

  const cards = [
    {
      title: 'Órdenes Procesadas',
      value: stats.total_ordenes,
      icon: <TrendingUp className="text-blue-600" size={32} />,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Efectivo',
      value: `$${stats.total_efectivo.toLocaleString()}`,
      icon: <DollarSign className="text-green-600" size={32} />,
      color: 'bg-green-50 border-green-200',
    },
    {
      title: 'Tarjetas',
      value: `$${stats.total_tarjeta.toLocaleString()}`,
      icon: <DollarSign className="text-purple-600" size={32} />,
      color: 'bg-purple-50 border-purple-200',
    },
    {
      title: 'Total Ingresos',
      value: `$${stats.total_ingresos.toLocaleString()}`,
      icon: <DollarSign className="text-red-600" size={32} />,
      color: 'bg-red-50 border-red-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-6 ${card.color}`}
          >
            <div className="flex items-center gap-4">
              {card.icon}
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INFORMACIÓN DEL TURNO */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Información del Turno</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Cajero</p>
            <p className="font-bold text-lg text-gray-800">{turno.cajero_nombre}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Efectivo Inicial</p>
            <p className="font-bold text-lg text-gray-800">${turno.efectivo_inicial.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Hora de Apertura</p>
            <p className="font-bold text-lg text-gray-800">
              {new Date(turno.abierto_at).toLocaleTimeString('es-CL')}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Duración del Turno</p>
            <p className="font-bold text-lg text-gray-800">
              {(() => {
                const now = new Date();
                const opening = new Date(turno.abierto_at);
                const diff = Math.floor((now.getTime() - opening.getTime()) / 1000 / 60);
                const hours = Math.floor(diff / 60);
                const mins = diff % 60;
                return `${hours}h ${mins}m`;
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* NOTA */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
        <p className="text-blue-800 font-semibold mb-2">💡 Nota</p>
        <p className="text-blue-700 text-sm">
          Las estadísticas se actualizan automáticamente. Cuando estés listo para cerrar el turno,
          ve a la pestaña <strong>"Cerrar Turno"</strong> para finalizar.
        </p>
      </div>
    </div>
  );
};

export default CashRegisterPanel;
