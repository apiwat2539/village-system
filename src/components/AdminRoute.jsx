import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Nested inside ProtectedRoute, so a valid accessToken is already guaranteed
// here — this only gates on role, once the profile has finished loading.
const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
