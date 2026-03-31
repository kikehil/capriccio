'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, MapPin } from 'lucide-react';


interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
    destination: {
        lat: number;
        lng: number;
        address: string;
    };
    currentPos?: {
        lat: number;
        lng: number;
    };
}

// Component to handle map view updates
function MapViewUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 15);
    }, [center, map]);
    return null;
}

const MapComponent: React.FC<MapModalProps> = ({ isOpen, onClose, destination, currentPos }) => {
    if (!isOpen) return null;

    // Fix for default marker icons
    const icon = L.icon({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`;

    const handleOpenExternal = () => {
        if (typeof window !== 'undefined') {
            window.open(googleMapsUrl, '_blank');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
                {/* Header Premium */}
                <header className="p-6 bg-slate-900 border-b border-white/5 flex justify-between items-center shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-black italic uppercase tracking-tighter leading-none">Ruta de Entrega</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Navegación en Tiempo Real</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-2xl transition-all active:scale-95"
                    >
                        <X size={24} />
                    </button>
                </header>

                {/* El Mapa */}
                <div className="flex-1 w-full relative overflow-hidden group">
                    <MapContainer
                        center={[destination.lat, destination.lng]}
                        zoom={15}
                        className="h-full w-full"
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        <Marker position={[destination.lat, destination.lng]} icon={icon}>
                            <Popup className="premium-popup">
                                <div className="p-2">
                                    <p className="font-black text-xs uppercase tracking-tighter">Destino:</p>
                                    <p className="text-xs text-slate-500">{destination.address}</p>
                                </div>
                            </Popup>
                        </Marker>

                        {currentPos && (
                            <Marker position={[currentPos.lat, currentPos.lng]} icon={icon}>
                                <Popup>
                                    <p className="font-bold">Tú estás aquí</p>
                                </Popup>
                            </Marker>
                        )}

                        <MapViewUpdater center={[destination.lat, destination.lng]} />
                    </MapContainer>

                    {/* Overlay de Dirección */}
                    <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
                        <div className="bg-white/95 backdrop-blur shadow-2xl p-6 rounded-[2rem] border border-slate-100 pointer-events-auto">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dirección de Entrega</p>
                            <p className="text-sm font-bold text-slate-900 leading-tight mb-4">{destination.address}</p>

                            <button
                                onClick={handleOpenExternal}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black italic uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-3 group active:scale-95"
                            >
                                <Navigation size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Abrir en Google Maps
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default MapComponent;
