import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="card">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(user.role)) {
            return <div className="card">Forbidden: insufficient permissions</div>;
        }
    }

    return children;
}
