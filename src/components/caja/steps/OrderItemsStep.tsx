'use client';

import React, { useState } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { CajaItem, CajaTurno } from '@/data/caja-types';
import ProductCustomizationModal from '../ProductCustomizationModal';

interface Pizza {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  activo: boolean;
  precios?: Record<string, number>;
  imagen?: string;
  descripcion?: string;
}

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
  turno: CajaTurno;
  onNext: () => void;
  onPrev: () => void;
}

const OrderItemsStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  turno,
  onNext,
  onPrev,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleAddWithCustomization = (pizza: Pizza, options: any) => {
    // Use pre-calculated values if provided (mitad y mitad, jumbo, combo promo)
    let itemName: string;
    let finalPrice: number;

    if (options.displayName) {
      itemName = options.displayName;
    } else {
      const sizeText = options.size ? ` (${options.size})` : '';
      const crustText = options.crust && options.crust !== 'sin-orilla' ? ` + ${options.crust}` : '';
      itemName = `${pizza.nombre}${sizeText}${crustText}`;
    }

    if (options.finalPrice !== undefined) {
      finalPrice = options.finalPrice;
    } else {
      const basePrice = pizza.precios && pizza.precios[options.size || 'mediana']
        ? pizza.precios[options.size || 'mediana']
        : pizza.precio;
      const crustPrices: Record<string, number> = {
        'sin-orilla': 0,
        'orilla-queso': 45,
        'dedos-queso': 30,
      };
      finalPrice = basePrice + (crustPrices[options.crust] || 0);
    }

    const newItem: CajaItem = {
      pizza_nombre: itemName,
      cantidad: options.cantidad,
      precio_unitario: finalPrice,
    };

    updateFormData({
      items: [...formData.items, newItem],
    });

    setShowModal(false);
  };

  const removeItem = (itemName: string) => {
    const updated = formData.items.filter((i: CajaItem) => i.pizza_nombre !== itemName);
    updateFormData({ items: updated });
  };

  const updateQuantity = (itemName: string, delta: number) => {
    const updated = formData.items.map((i: CajaItem) => {
      if (i.pizza_nombre === itemName) {
        const newQty = i.cantidad + delta;
        return newQty > 0 ? { ...i, cantidad: newQty } : i;
      }
      return i;
    });
    updateFormData({ items: updated });
  };

  const total = formData.items.reduce(
    (sum: number, item: CajaItem) => sum + item.precio_unitario * item.cantidad,
    0
  );

  const handleNext = () => {
    if (formData.items.length === 0) {
      alert('Debes agregar al menos un ítem');
      return;
    }
    updateFormData({ total });
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Selecciona Items</h2>
      <p className="text-gray-600 mb-6">Busca y agrega productos al pedido</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BOTÓN AGREGAR PRODUCTOS */}
        <div className="lg:col-span-2">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-lg transition flex items-center justify-center gap-3 text-lg"
          >
            <ShoppingCart size={24} />
            Agregar Producto
          </button>

          {formData.items.length === 0 && (
            <div className="mt-8 p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 text-lg">
                👆 Presiona el botón para agregar productos
              </p>
            </div>
          )}
        </div>

        {/* RESUMEN DE CARRITO */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-fit sticky top-20">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Carrito ({formData.items.length})</h3>

          {formData.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Sin items</p>
          ) : (
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {formData.items.map((item: CajaItem) => (
                <div key={item.pizza_nombre} className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">{item.pizza_nombre}</p>
                      <p className="text-red-600 text-sm">
                        ${item.precio_unitario.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.pizza_nombre)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.pizza_nombre, -1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3 font-bold text-gray-800">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.pizza_nombre, 1)}
                      className="px-2 py-1 bg-green-200 rounded hover:bg-green-300 transition"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="ml-auto font-semibold text-gray-800">
                      ${(item.precio_unitario * item.cantidad).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TOTAL */}
          <div className="border-t border-gray-300 pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Total:</span>
              <span className="text-2xl font-bold text-red-600">
                ${total.toLocaleString()}
              </span>
            </div>

            <p className="text-xs text-gray-600">
              {formData.items.length} ítem{formData.items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
        >
          Atrás
        </button>
        <button
          onClick={handleNext}
          disabled={formData.items.length === 0}
          className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
        >
          Siguiente
        </button>
      </div>

      {/* PRODUCT CUSTOMIZATION MODAL */}
      {showModal && (
        <ProductCustomizationModal onAdd={handleAddWithCustomization} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default OrderItemsStep;
