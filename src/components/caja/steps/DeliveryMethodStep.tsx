'use client';

import React from 'react';
import { Home, MapPin, ShoppingBag } from 'lucide-react';
import { DeliveryMethod, CajaTurno } from '@/data/caja-types';

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
  turno: CajaTurno;
  onNext: () => void;
  onPrev: () => void;
}

const DeliveryMethodStep: React.FC<StepProps> = ({ formData, updateFormData, onNext }) => {
  const handleSelect = (method: DeliveryMethod) => {
    updateFormData({ metodo_entrega: method });
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Cómo se entrega?</h2>
      <p className="text-gray-600 mb-6">Selecciona el método de entrega del pedido</p>

      <div className="grid grid-cols-1 gap-4">
        {/* COMER EN SUCURSAL */}
        <button
          onClick={() => handleSelect('sucursal')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition group"
        >
          <div className="flex items-center gap-4">
            <Home className="text-red-600 group-hover:scale-110 transition" size={32} />
            <div className="text-left">
              <h3 className="font-bold text-lg text-gray-800">Comer en Sucursal</h3>
              <p className="text-sm text-gray-600">Cliente come en el local</p>
            </div>
          </div>
        </button>

        {/* PARA LLEVAR */}
        <button
          onClick={() => handleSelect('para_llevar')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition group"
        >
          <div className="flex items-center gap-4">
            <ShoppingBag className="text-red-600 group-hover:scale-110 transition" size={32} />
            <div className="text-left">
              <h3 className="font-bold text-lg text-gray-800">Para Llevar</h3>
              <p className="text-sm text-gray-600">Cliente retira en el local</p>
            </div>
          </div>
        </button>

        {/* A DOMICILIO */}
        <button
          onClick={() => handleSelect('domicilio')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition group"
        >
          <div className="flex items-center gap-4">
            <MapPin className="text-red-600 group-hover:scale-110 transition" size={32} />
            <div className="text-left">
              <h3 className="font-bold text-lg text-gray-800">A Domicilio</h3>
              <p className="text-sm text-gray-600">Entrega en dirección del cliente</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DeliveryMethodStep;
