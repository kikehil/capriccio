import KitchenDisplay from '@/components/kitchen/KitchenDisplay';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CocinaPage() {
    return (
        <ProtectedRoute role="cocina">
            <KitchenDisplay />
        </ProtectedRoute>
    );
}
