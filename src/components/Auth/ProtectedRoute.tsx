import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // Wait for the auth check to finish before booting anyone out
  if (loading) return <div>Loading...</div>;

  // 1. Not logged in at all? Kick to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Logged in, but wrong role? Kick to their specific dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  // 3. Logged in and correct role? Let them through!
  return <Outlet />;
};

export default ProtectedRoute; // <--- This is the exact export App.tsx is looking for