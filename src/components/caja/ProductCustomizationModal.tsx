'use client';

import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/components/caja/steps/OrderItemsStep';

interface CustomizationOptions {
  size?: string;
  extras: string[];
  cantidad: number;
}

interface ProductCustomizationModalProps {
  product: MenuItem;
  onAdd: (product: MenuItem, options: CustomizationOptions) => void;
  onClose: () => void;
}

const ProductCustomizationModal: React.FC<ProductCustomizationModalProps> = ({
  product,
  onAdd,
  onClose,
}) => {
  const [options, setOptions] = useState<CustomizationOptions>({
    size: 'mediana',
    extras: [],
    cantidad: 1,
  });

  const sizes = ['chica', 'mediana', 'grande'];
  const sizeMultipliers: Record<string, number> = {
    chica: 0.85,
    mediana: 1,
    grande: 1.3,
  };

  const availableExtras = [
    { id: 'orilla-queso', nombre: 'Orilla de Queso', precio: 45 },
    { id: 'extra-queso', nombre: 'Extra Queso', precio: 35 },
    { id: 'dedos-queso', nombre: 'Dedos de Queso', precio: 30 },
  ];

  const basePrice = product.precio;
  const sizeAdjustment = basePrice * (sizeMultipliers[options.size || 'mediana'] - 1);
  const extrasPrice = availableExtras
    .filter(extra => options.extras.includes(extra.id))
    .reduce((sum, extra) => sum + extra.precio, 0);

  const unitPrice = basePrice + sizeAdjustment + extrasPrice;
  const totalPrice = unitPrice * options.cantidad;

  const toggleExtra = (extraId: string) => {
    setOptions(prev => ({
      ...prev,
      extras: prev.extras.includes(extraId)
        ? prev.extras.filter(e => e !== extraId)
        : [...prev.extras, extraId],
    }));
  };

  const handleAddToCart = () => {
    onAdd(product, options);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b flex justify-between items-center p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.nombre}</h2>
            <p className="text-gray-600 text-sm mt-1">{product.descripcion}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* TAMAÑO */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Tamaño</h3>
            <div className="grid grid-cols-3 gap-3">
              {sizes.map(size => {
                const sizePrice = basePrice * sizeMultipliers[size];
                return (
                  <button
                    key={size}
                    onClick={() => setOptions(prev => ({ ...prev, size }))}
                    className={`p-4 rounded-lg border-2 transition font-semibold text-center ${
                      options.size === size
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-800 hover:border-red-300'
                    }`}
                  >
                    <div className="capitalize">{size}</div>
                    <div className="text-sm mt-1">${sizePrice.toLocaleString()}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* EXTRAS */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Agregar Extras</h3>
            <div className="space-y-2">
              {availableExtras.map(extra => (
                <label key={extra.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={options.extras.includes(extra.id)}
                    onChange={() => toggleExtra(extra.id)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex-1 ml-3">
                    <p className="font-medium text-gray-800">{extra.nombre}</p>
                  </div>
                  <span className="text-red-600 font-bold">+${extra.precio.toLocaleString()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* CANTIDAD */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Cantidad</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setOptions(prev => ({
                    ...prev,
                    cantidad: Math.max(1, prev.cantidad - 1),
                  }))
                }
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                {options.cantidad}
              </span>
              <button
                onClick={() =>
                  setOptions(prev => ({
                    ...prev,
                    cantidad: prev.cantidad + 1,
                  }))
                }
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* RESUMEN DE PRECIO */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Precio unitario:</span>
                <span>${unitPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Cantidad:</span>
                <span>{options.cantidad}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-red-600">${totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Agregar al Carrito (${totalPrice.toLocaleString()})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizationModal;
