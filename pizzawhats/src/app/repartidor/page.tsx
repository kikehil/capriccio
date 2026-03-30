'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const DeliveryDashboard = dynamic(
    () => import('@/components/delivery/DeliveryDashboard'),
    { ssr: false }
);

export default function RepartidorPage() {
    return (
        <ProtectedRoute role="repartidor">
            <div className="bg-[#f0f2f5] min-h-screen">
                <DeliveryDashboard />
            </div>
        </ProtectedRoute>
    );
}
