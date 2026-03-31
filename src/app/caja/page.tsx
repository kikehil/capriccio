'use client';

import React, { useEffect, useState } from 'react';
import CajaLogin from '@/components/caja/CajaLogin';
import CajaDashboard from '@/components/caja/CajaDashboard';
import { CajaTurno } from '@/data/caja-types';
import { API_URL } from '@/lib/socket';

export default function CajaPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [turno, setTurno] = useState<CajaTurno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const token = localStorage.getItem('capriccio_token_caja');
    const role = localStorage.getItem('capriccio_user_role');

    if (token && role === 'caja') {
      setIsAuthenticated(true);
      fetchActiveTurno(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchActiveTurno = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/caja/turno/activo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Token expirado o inválido → forzar re-login
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('capriccio_token_caja');
        localStorage.removeItem('capriccio_user_role');
        localStorage.removeItem('capriccio_username');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setTurno(data);
      }
    } catch (error) {
      console.error('Error fetching turno:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token: string) => {
    setIsAuthenticated(true);
    fetchActiveTurno(token);
  };

  const handleTurnoCreated = (newTurno: CajaTurno) => {
    setTurno(newTurno);
  };

  const handleLogout = () => {
    localStorage.removeItem('capriccio_token_caja');
    localStorage.removeItem('capriccio_user_role');
    localStorage.removeItem('capriccio_username');
    setIsAuthenticated(false);
    setTurno(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <CajaLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <CajaDashboard
      turno={turno}
      onTurnoCreated={handleTurnoCreated}
      onLogout={handleLogout}
    />
  );
}
