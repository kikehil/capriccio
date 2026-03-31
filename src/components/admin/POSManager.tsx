'use client';

import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Users, TrendingUp, Eye, Download } from 'lucide-react';
import { API_URL } from '@/lib/socket';

interface ShiftData {
  id: number;
  cajero_nombre: string;
  abierto_at: string;
  cerrado_at?: string;
  efectivo_inicial: number;
  efectivo_recibido?: number;
  efectivo_reportado?: number;
  diferencia?: number;
  total_ordenes_caja?: number;
  liquidado: number;
}

interface ShiftReport {
  turno: ShiftData;
  ordenes: any[];
  resumen: {
    total_ordenes: number;
    ordenes_pagadas: number;
    total_efectivo: number;
    total_tarjeta: number;
    ordenes_llamada: number;
    ordenes_presencial: number;
    ordenes_web: number;
  };
}

const POSManager: React.FC = () => {
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<ShiftReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem('capriccio_token_admin');
      // Por ahora, obtenemos turnos cerrados de estadísticas
      // En una versión mejorada, necesitaríamos un endpoint específico
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        // Para demo, mostramos estadísticas genéricas
        // En producción, esto vendría de un endpoint de turnos
        setShifts([]);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShiftDetails = async (shiftId: number) => {
    try {
      const token = localStorage.getItem('capriccio_token_admin');
      const response = await fetch(`${API_URL}/api/caja/reporte/turno/${shiftId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedShift(data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error fetching shift details:', error);
    }
  };

  const downloadReport = () => {
    if (!selectedShift) return;

    const { turno, resumen } = selectedShift;
    const csv = [
      ['REPORTE DE TURNO DE CAJA'],
      [],
      ['Cajero', turno.cajero_nombre],
      ['Hora Apertura', new Date(turno.abierto_at).toLocaleString()],
      ['Hora Cierre', turno.cerrado_at ? new Date(turno.cerrado_at).toLocaleString() : 'N/A'],
      ['Efectivo Inicial', turno.efectivo_inicial],
      ['Efectivo Recibido', turno.efectivo_recibido || 0],
      ['Efectivo Reportado', turno.efectivo_reportado || 0],
      ['Diferencia', turno.diferencia || 0],
      [],
      ['RESUMEN DE ÓRDENES'],
      [],
      ['Total Órdenes', resumen.total_ordenes],
      ['Órdenes Pagadas', resumen.ordenes_pagadas],
      ['Total Efectivo', resumen.total_efectivo],
      ['Total Tarjeta', resumen.total_tarjeta],
      ['Órdenes Llamada', resumen.ordenes_llamada],
      ['Órdenes Presencial', resumen.ordenes_presencial],
      ['Órdenes Web', resumen.ordenes_web],
    ]
      .map(row => row.join(','))
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `reporte_caja_${turno.cajero_nombre}_${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Caja (POS)</h2>
        <p className="text-gray-600">
          Sistema de Punto de Venta integrado. Accede en <code className="bg-white px-2 py-1 rounded">/caja</code>
        </p>
      </div>

      {/* QUICK LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/caja"
          target="_blank"
          className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-3 transition"
        >
          <Clock size={24} />
          <div>
            <p className="font-semibold">Ir al POS</p>
            <p className="text-sm opacity-90">Crear pedidos en caja</p>
          </div>
        </a>

        <div className="p-4 bg-white border border-gray-200 rounded-lg flex items-center gap-3">
          <DollarSign size={24} className="text-green-600" />
          <div>
            <p className="font-semibold text-gray-800">Efectivo Hoy</p>
            <p className="text-sm text-gray-600">Ver en estadísticas</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg flex items-center gap-3">
          <Users size={24} className="text-blue-600" />
          <div>
            <p className="font-semibold text-gray-800">Cajeros Activos</p>
            <p className="text-sm text-gray-600">Monitoreo en vivo</p>
          </div>
        </div>
      </div>

      {/* SHIFT HISTORY */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Historial de Turnos</h3>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Cargando turnos...</div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-600">
            <p className="mb-2">No hay turnos registrados aún</p>
            <p className="text-sm">
              Los turnos aparecerán aquí cuando los cajeros abran sesión en <code>/caja</code>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Cajero</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Hora Apertura</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Efectivo Inicial</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Recibido</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Diferencia</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{shift.cajero_nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(shift.abierto_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      ${shift.efectivo_inicial.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      ${(shift.efectivo_recibido || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          (shift.diferencia || 0) === 0
                            ? 'bg-green-100 text-green-800'
                            : (shift.diferencia || 0) > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        ${(shift.diferencia || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => fetchShiftDetails(shift.id)}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                      >
                        <Eye size={16} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SHIFT DETAILS MODAL */}
      {showDetails && selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Reporte de Turno</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* TURNO INFO */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div>
                <p className="text-gray-600 text-sm">Cajero</p>
                <p className="font-bold text-lg text-gray-800">{selectedShift.turno.cajero_nombre}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Duración</p>
                <p className="font-bold text-lg text-gray-800">
                  {selectedShift.turno.cerrado_at
                    ? Math.floor(
                        (new Date(selectedShift.turno.cerrado_at).getTime() -
                          new Date(selectedShift.turno.abierto_at).getTime()) /
                          60000
                      )
                    : '-'}{' '}
                  min
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Efectivo Inicial</p>
                <p className="font-bold text-lg text-gray-800">
                  ${selectedShift.turno.efectivo_inicial.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Efectivo Recibido</p>
                <p className="font-bold text-lg text-green-600">
                  ${(selectedShift.turno.efectivo_recibido || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Efectivo Reportado</p>
                <p className="font-bold text-lg text-gray-800">
                  ${(selectedShift.turno.efectivo_reportado || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Diferencia</p>
                <p
                  className={`font-bold text-lg ${
                    (selectedShift.turno.diferencia || 0) === 0
                      ? 'text-green-600'
                      : (selectedShift.turno.diferencia || 0) > 0
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  ${(selectedShift.turno.diferencia || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* RESUMEN */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-4">Resumen de Órdenes</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Total Órdenes</p>
                  <p className="font-bold text-2xl text-blue-600">{selectedShift.resumen.total_ordenes}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Efectivo</p>
                  <p className="font-bold text-lg text-green-600">
                    ${selectedShift.resumen.total_efectivo.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Tarjeta</p>
                  <p className="font-bold text-lg text-purple-600">
                    ${selectedShift.resumen.total_tarjeta.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Llamadas</p>
                  <p className="font-bold text-lg text-orange-600">{selectedShift.resumen.ordenes_llamada}</p>
                </div>
                <div className="bg-pink-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Presencial</p>
                  <p className="font-bold text-lg text-pink-600">{selectedShift.resumen.ordenes_presencial}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Web</p>
                  <p className="font-bold text-lg text-indigo-600">{selectedShift.resumen.ordenes_web}</p>
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
              <button
                onClick={downloadReport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
              >
                <Download size={20} />
                Descargar CSV
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSManager;
