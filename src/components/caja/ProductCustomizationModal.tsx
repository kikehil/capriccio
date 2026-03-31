'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { API_URL } from '@/lib/socket';

interface Pizza {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  activo: boolean;
  precios?: Record<string, number>;
}

interface CustomizationOptions {
  size?: string;
  crust?: string;
  extras: string[];
  cantidad: number;
  finalPrice?: number;
  displayName?: string;
}

interface ProductCustomizationModalProps {
  selectedProductId?: number;
  onAdd: (pizza: Pizza, options: CustomizationOptions) => void;
  onClose: () => void;
}

const SIZES = ['chica', 'mediana', 'grande'];
const SIZE_PRICES: Record<string, number> = {
  chica: 0.85,
  mediana: 1,
  grande: 1.3,
};

const CRUST_OPTIONS = [
  { id: 'sin-orilla', nombre: 'Sin Orilla Rellena', precio: 0 },
  { id: 'orilla-queso', nombre: 'Orilla Rellena de Queso', precio: 45 },
  { id: 'dedos-queso', nombre: 'Dedos de Queso', precio: 30 },
];

const PROMO_SIZES = [
  { id: '2_medianas', label: '2 Medianas', price: 245 },
  { id: '2_grandes', label: '2 Grandes', price: 275 },
];

const CATEGORY_KEYWORDS: Array<{ keywords: string[]; icon: string }> = [
  { keywords: ['pizza', 'pizzas'], icon: '🍕' },
  { keywords: ['hamburguesa', 'hamburguesas', 'burger', 'burgers'], icon: '🍔' },
  { keywords: ['bebida', 'bebidas', 'refresco', 'refrescos', 'agua', 'drink'], icon: '🥤' },
  { keywords: ['snack', 'snacks', 'papa', 'papas', 'frita'], icon: '🍟' },
  { keywords: ['postre', 'postres', 'dulce', 'helado', 'pastel'], icon: '🍰' },
  { keywords: ['ensalada', 'ensaladas', 'entrada', 'entradas', 'sopa'], icon: '🥗' },
  { keywords: ['ala', 'alas', 'pollo', 'boneless', 'alitas'], icon: '🍗' },
  { keywords: ['especial', 'especiales', 'promo', 'combo'], icon: '⭐' },
  { keywords: ['burrito', 'burritos', 'taco', 'tacos', 'mexicano'], icon: '🌯' },
];

const getCategoryIcon = (categoria: string): string => {
  const lower = categoria.toLowerCase();
  for (const { keywords, icon } of CATEGORY_KEYWORDS) {
    if (keywords.some(k => lower.includes(k))) return icon;
  }
  const emojiMatch = categoria.match(/^\p{Emoji}/u);
  if (emojiMatch) return emojiMatch[0];
  return '🍽️';
};

type Step = 'category-select' | 'product-select' | 'customize' | 'promo';

const ProductCustomizationModal: React.FC<ProductCustomizationModalProps> = ({
  selectedProductId,
  onAdd,
  onClose,
}) => {
  const [products, setProducts] = useState<Pizza[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Pizza | null>(null);
  const [options, setOptions] = useState<{ size: string; crust: string; cantidad: number }>({
    size: 'mediana',
    crust: 'sin-orilla',
    cantidad: 1,
  });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('category-select');

  // Mitad y mitad state
  const [isMitadYMitad, setIsMitadYMitad] = useState(false);
  const [segundaMitad, setSegundaMitad] = useState<Pizza | null>(null);

  // JUMBO state
  const [numEspecialidades, setNumEspecialidades] = useState(1);
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<string[]>(['', '', '', '']);

  // Combo promo state
  const [promoSize, setPromoSize] = useState(PROMO_SIZES[0]);
  const [promoPizza1, setPromoPizza1] = useState<Pizza | null>(null);
  const [promoPizza2, setPromoPizza2] = useState<Pizza | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/productos`);
        if (!response.ok) throw new Error('Error al cargar productos');
        const data = await response.json();

        const filtered = data
          .filter((p: any) => p.activo === 1 || p.activo === true)
          .map((p: any) => ({
            ...p,
            precios: typeof p.precios === 'string' ? JSON.parse(p.precios) : p.precios,
          }));

        setProducts(filtered);

        if (selectedProductId) {
          const selected = filtered.find((p: Pizza) => p.id === selectedProductId);
          if (selected) {
            setSelectedProduct(selected);
            setStep('customize');
          }
        }
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedProductId]);

  // Pizzas disponibles para mitad y mitad / JUMBO (solo pizzas, excluyendo jumbo)
  const pizzasForSpecialty = products.filter(
    p => p.categoria.toLowerCase().includes('pizza') && !p.nombre.toLowerCase().includes('jumbo')
  );

  const getProductPrice = (pizza: Pizza, size: string): number => {
    if (pizza.precios && pizza.precios[size]) {
      return pizza.precios[size];
    }
    return pizza.precio * (SIZE_PRICES[size] || 1);
  };

  // Helpers
  const isPizzaProduct = (pizza: Pizza) => pizza.categoria.toLowerCase().includes('pizza');
  const isJumbo = selectedProduct?.nombre?.toLowerCase().trim() === 'jumbo';

  // Available sizes for selected product (add jumbo if product has jumbo price)
  const availableSizes = React.useMemo(() => {
    if (!selectedProduct) return SIZES;
    const sizes = [...SIZES];
    if (selectedProduct.precios?.jumbo) sizes.push('jumbo');
    return sizes;
  }, [selectedProduct]);

  const canHalfAndHalf =
    selectedProduct &&
    isPizzaProduct(selectedProduct) &&
    !isJumbo &&
    (options.size === 'mediana' || options.size === 'grande');

  // Price calculation
  const calculatePrice = (): number => {
    if (!selectedProduct) return 0;

    if (isJumbo) {
      // JUMBO: flat price regardless of specialties count
      return selectedProduct.precios?.jumbo || selectedProduct.precio;
    }

    const basePrice = getProductPrice(selectedProduct, options.size);

    if (isMitadYMitad && segundaMitad && canHalfAndHalf) {
      const segundaPrice = getProductPrice(segundaMitad, options.size);
      const mitadBase = Math.max(basePrice, segundaPrice);
      const crustPrice = CRUST_OPTIONS.find(c => c.id === options.crust)?.precio || 0;
      return (mitadBase + crustPrice) * options.cantidad;
    }

    const crustPrice = CRUST_OPTIONS.find(c => c.id === options.crust)?.precio || 0;
    return (basePrice + crustPrice) * options.cantidad;
  };

  const unitPrice = calculatePrice() / options.cantidad;
  const totalPrice = calculatePrice();

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setStep('product-select');
  };

  const handleSelectProduct = (pizza: Pizza) => {
    setSelectedProduct(pizza);
    setStep('customize');
    setOptions({ size: 'mediana', crust: 'sin-orilla', cantidad: 1 });
    setIsMitadYMitad(false);
    setSegundaMitad(null);
    setNumEspecialidades(1);
    const defaultName = pizzasForSpecialty[0]?.nombre || '';
    setSelectedEspecialidades([defaultName, defaultName, defaultName, defaultName]);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    let displayName = selectedProduct.nombre;
    let finalPrice = unitPrice;

    if (isJumbo) {
      const activeEsp = selectedEspecialidades.slice(0, numEspecialidades).filter(Boolean);
      if (activeEsp.length > 0) {
        displayName = `Jumbo (${numEspecialidades} Esp: ${activeEsp.join(', ')})`;
      } else {
        displayName = 'Jumbo';
      }
      finalPrice = selectedProduct.precios?.jumbo || selectedProduct.precio;
    } else if (isMitadYMitad && segundaMitad && canHalfAndHalf) {
      const baseP = getProductPrice(selectedProduct, options.size);
      const segundaP = getProductPrice(segundaMitad, options.size);
      const crustP = CRUST_OPTIONS.find(c => c.id === options.crust)?.precio || 0;
      finalPrice = Math.max(baseP, segundaP) + crustP;
      const crustText = options.crust !== 'sin-orilla'
        ? ` + ${CRUST_OPTIONS.find(c => c.id === options.crust)?.nombre}`
        : '';
      displayName = `${selectedProduct.nombre} + ${segundaMitad.nombre} (${options.size} - Mitad y Mitad)${crustText}`;
    } else {
      const crustP = CRUST_OPTIONS.find(c => c.id === options.crust)?.precio || 0;
      finalPrice = getProductPrice(selectedProduct, options.size) + crustP;
      const sizeText = options.size ? ` (${options.size})` : '';
      const crustText = options.crust !== 'sin-orilla'
        ? ` + ${CRUST_OPTIONS.find(c => c.id === options.crust)?.nombre}`
        : '';
      displayName = `${selectedProduct.nombre}${sizeText}${crustText}`;
    }

    onAdd(selectedProduct, {
      size: options.size,
      crust: options.crust,
      extras: [],
      cantidad: options.cantidad,
      finalPrice,
      displayName,
    });
    onClose();
  };

  const handleAddPromo = () => {
    if (!promoPizza1 || !promoPizza2) return;

    const virtualPizza: Pizza = {
      id: 0,
      nombre: `Combo Promo: ${promoSize.label}`,
      descripcion: `${promoPizza1.nombre} + ${promoPizza2.nombre}`,
      precio: promoSize.price,
      imagen: '',
      categoria: 'Promo',
      activo: true,
    };

    onAdd(virtualPizza, {
      size: promoSize.label,
      crust: 'sin-orilla',
      extras: [],
      cantidad: 1,
      finalPrice: promoSize.price,
      displayName: `Combo ${promoSize.label}: ${promoPizza1.nombre} + ${promoPizza2.nombre}`,
    });
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(products.map(p => p.categoria))).sort((a, b) =>
    a.localeCompare(b, 'es')
  );

  // ─── STEP: PROMO ────────────────────────────────────────────────────────────
  if (step === 'promo') {
    const isComplete = promoPizza1 !== null && promoPizza2 !== null;
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-5 flex items-center gap-3">
            <button
              onClick={() => setStep('category-select')}
              className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">🔥 Combo Promo</h2>
              <p className="text-sm text-gray-500">Arma tu combo de 2 pizzas</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Tamaño */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3">1. Elige el tamaño</h3>
              <div className="grid grid-cols-2 gap-3">
                {PROMO_SIZES.map(size => (
                  <button
                    key={size.id}
                    onClick={() => setPromoSize(size)}
                    className={`p-4 rounded-xl border-2 font-bold transition flex items-center justify-between ${
                      promoSize.id === size.id
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-700 hover:border-red-300'
                    }`}
                  >
                    <span>{size.label}</span>
                    <span className="text-lg">${size.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pizza 1 */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3">2. Primera Pizza</h3>
              <select
                value={promoPizza1?.id || ''}
                onChange={e => {
                  const p = pizzasForSpecialty.find(p => p.id === Number(e.target.value));
                  setPromoPizza1(p || null);
                }}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:border-red-500 outline-none font-medium"
              >
                <option value="" disabled>Selecciona una pizza...</option>
                {[...pizzasForSpecialty].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              {promoPizza1 && (
                <div className="mt-2 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {promoPizza1.imagen && (
                    <img src={promoPizza1.imagen} alt={promoPizza1.nombre} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <span className="text-sm text-gray-600 italic">{promoPizza1.descripcion}</span>
                </div>
              )}
            </div>

            {/* Pizza 2 */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3">3. Segunda Pizza</h3>
              <select
                value={promoPizza2?.id || ''}
                onChange={e => {
                  const p = pizzasForSpecialty.find(p => p.id === Number(e.target.value));
                  setPromoPizza2(p || null);
                }}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:border-red-500 outline-none font-medium"
              >
                <option value="" disabled>Selecciona una pizza...</option>
                {[...pizzasForSpecialty].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              {promoPizza2 && (
                <div className="mt-2 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {promoPizza2.imagen && (
                    <img src={promoPizza2.imagen} alt={promoPizza2.nombre} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <span className="text-sm text-gray-600 italic">{promoPizza2.descripcion}</span>
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total Combo:</span>
                <span className="text-red-600">${promoSize.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t p-5">
            <button
              onClick={handleAddPromo}
              disabled={!isComplete}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 active:scale-95 text-white rounded-xl font-bold text-lg transition flex items-center justify-center gap-3"
            >
              <ShoppingCart size={22} />
              {isComplete
                ? `Agregar Combo — $${promoSize.price.toLocaleString()}`
                : 'Selecciona ambas pizzas'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 1: CATEGORY SELECT ─────────────────────────────────────────────────
  if (step === 'category-select') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">¿Qué tipo de producto?</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Combo Promo button */}
              <button
                onClick={() => {
                  setPromoSize(PROMO_SIZES[0]);
                  setPromoPizza1(null);
                  setPromoPizza2(null);
                  setStep('promo');
                }}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400 rounded-xl hover:border-red-600 hover:bg-red-50 transition-all active:scale-95 shadow-md hover:shadow-lg"
              >
                <span className="text-5xl">🔥</span>
                <span className="font-bold text-red-700 text-center text-base leading-tight">Combo Promo</span>
                <span className="text-xs text-red-500 font-semibold">2 pizzas al precio especial</span>
              </button>

              {categories.map(category => {
                const icon = getCategoryIcon(category);
                const count = products.filter(p => p.categoria === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => handleSelectCategory(category)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all active:scale-95 shadow-sm hover:shadow-md"
                  >
                    <span className="text-5xl">{icon}</span>
                    <span className="font-bold text-gray-800 text-center text-base leading-tight">{category}</span>
                    <span className="text-xs text-gray-500">{count} producto{count !== 1 ? 's' : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 2: PRODUCT SELECT ───────────────────────────────────────────────────
  if (step === 'product-select') {
    const categoryProducts = products.filter(p => p.categoria === selectedCategory);
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-5 flex items-center gap-3">
            <button
              onClick={() => setStep('category-select')}
              className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {getCategoryIcon(selectedCategory!)} {selectedCategory}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...categoryProducts]
                .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
                .map(pizza => (
                  <button
                    key={pizza.id}
                    onClick={() => handleSelectProduct(pizza)}
                    className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all active:scale-95 text-left"
                  >
                    {pizza.imagen ? (
                      <img
                        src={pizza.imagen}
                        alt={pizza.nombre}
                        className="w-full h-36 object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-4xl">
                        {getCategoryIcon(pizza.categoria)}
                      </div>
                    )}
                    <div className="p-3 bg-white">
                      <p className="font-bold text-sm text-gray-800 leading-tight">{pizza.nombre}</p>
                      <p className="text-red-600 font-bold text-sm mt-1">
                        desde ${pizza.precio.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 3: CUSTOMIZE ───────────────────────────────────────────────────────
  const showCrustOptions =
    selectedProduct &&
    isPizzaProduct(selectedProduct) &&
    (options.size === 'mediana' || options.size === 'grande' || options.size === 'jumbo');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b p-5 flex items-center gap-3">
          <button
            onClick={() => { setStep('product-select'); setSelectedProduct(null); }}
            className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{selectedProduct?.nombre}</h2>
            {selectedProduct?.descripcion && (
              <p className="text-gray-500 text-sm mt-0.5">{selectedProduct.descripcion}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {selectedProduct?.imagen && (
            <div className="flex justify-center">
              <img
                src={selectedProduct.imagen}
                alt={selectedProduct.nombre}
                className="w-40 h-40 object-cover rounded-xl shadow"
              />
            </div>
          )}

          {/* JUMBO: especialidades selector */}
          {isJumbo ? (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Especialidades (hasta 4)</h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setNumEspecialidades(num)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition border-2 ${
                      numEspecialidades === num
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-gray-200 text-gray-700 hover:border-red-300'
                    }`}
                  >
                    {num} Esp.
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: numEspecialidades }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-red-600 font-bold text-sm w-5">{index + 1}.</span>
                    <select
                      value={selectedEspecialidades[index] || ''}
                      onChange={e => {
                        const newEsp = [...selectedEspecialidades];
                        newEsp[index] = e.target.value;
                        setSelectedEspecialidades(newEsp);
                      }}
                      className="flex-1 border-2 border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:border-red-500 outline-none font-medium text-sm"
                    >
                      <option value="" disabled>Selecciona especialidad...</option>
                      {[...pizzasForSpecialty]
                        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
                        .map(esp => (
                          <option key={esp.id} value={esp.nombre}>{esp.nombre}</option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* TAMAÑO */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Tamaño</h3>
                <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${availableSizes.length}, 1fr)` }}>
                  {availableSizes.map(size => {
                    const price = getProductPrice(selectedProduct!, size);
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setOptions(prev => ({ ...prev, size }));
                          setIsMitadYMitad(false);
                          setSegundaMitad(null);
                        }}
                        className={`p-4 rounded-xl border-2 transition font-semibold text-center active:scale-95 ${
                          options.size === size
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-800 hover:border-red-300'
                        }`}
                      >
                        <div className="capitalize text-base">{size}</div>
                        <div className="text-sm mt-1 font-bold">${price.toLocaleString()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MITAD Y MITAD (pizza, mediana o grande) */}
              {canHalfAndHalf && (
                <div className="border-t pt-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => {
                      const newVal = !isMitadYMitad;
                      setIsMitadYMitad(newVal);
                      if (newVal && !segundaMitad) {
                        const options2 = pizzasForSpecialty.filter(
                          e => e.nombre !== selectedProduct?.nombre
                        );
                        if (options2.length > 0) setSegundaMitad(options2[0]);
                      }
                    }}
                  >
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition flex-shrink-0 ${
                        isMitadYMitad
                          ? 'bg-red-600 border-red-600'
                          : 'border-gray-400 group-hover:border-red-400'
                      }`}
                    >
                      {isMitadYMitad && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-bold text-gray-700 select-none">
                      Mitad y Mitad — combinar con otra especialidad
                    </span>
                  </div>

                  {isMitadYMitad && (
                    <div className="mt-3 ml-9">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Selecciona la 2da Mitad:
                      </p>
                      <select
                        value={segundaMitad?.id || ''}
                        onChange={e => {
                          const p = pizzasForSpecialty.find(p => p.id === Number(e.target.value));
                          setSegundaMitad(p || null);
                        }}
                        className="w-full border-2 border-gray-300 rounded-xl px-3 py-2.5 text-gray-800 focus:border-red-500 outline-none font-medium text-sm"
                      >
                        {[...pizzasForSpecialty]
                          .filter(e => e.nombre !== selectedProduct?.nombre)
                          .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
                          .map(esp => (
                            <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                          ))}
                      </select>
                      {segundaMitad && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          Precio: el más caro entre ambas mitades ($
                          {Math.max(
                            getProductPrice(selectedProduct!, options.size),
                            getProductPrice(segundaMitad, options.size)
                          ).toLocaleString()}
                          )
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ORILLA (si aplica) */}
          {showCrustOptions && !isJumbo && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Orilla Rellena</h3>
              <div className="space-y-2">
                {CRUST_OPTIONS.map(crust => (
                  <label
                    key={crust.id}
                    className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition ${
                      options.crust === crust.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="crust"
                      checked={options.crust === crust.id}
                      onChange={() => setOptions(prev => ({ ...prev, crust: crust.id }))}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="flex-1 ml-3 font-medium text-gray-800">{crust.nombre}</span>
                    {crust.precio > 0 && (
                      <span className="text-red-600 font-bold">+${crust.precio}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* CANTIDAD */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Cantidad</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setOptions(prev => ({ ...prev, cantidad: Math.max(1, prev.cantidad - 1) }))}
                className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition"
              >
                <Minus size={20} />
              </button>
              <span className="text-3xl font-bold text-gray-900 w-16 text-center">{options.cantidad}</span>
              <button
                onClick={() => setOptions(prev => ({ ...prev, cantidad: prev.cantidad + 1 }))}
                className="w-12 h-12 flex items-center justify-center border-2 border-green-400 rounded-xl hover:bg-green-50 transition text-green-700"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* RESUMEN */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-5">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Precio unitario:</span>
                <span className="font-semibold">${unitPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Cantidad:</span>
                <span className="font-semibold">{options.cantidad}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-red-600">${totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-white border-t p-5">
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl font-bold text-lg transition flex items-center justify-center gap-3"
          >
            <ShoppingCart size={22} />
            Agregar al Pedido — ${totalPrice.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizationModal;
