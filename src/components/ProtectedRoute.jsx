import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'var(--bg-main)'
            }}>
                <div className="loader">Cargando...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute;
