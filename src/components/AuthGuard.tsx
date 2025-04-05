
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFirebase } from '@/contexts/FirebaseContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { user, loading } = useFirebase();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // If we require auth and there's no user, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }
  
  // If we don't require auth (login page) and there is a user, redirect to home
  if (!requireAuth && user) {
    // Only redirect if we're actually on the login page to prevent infinite redirects
    if (location.pathname === "/login") {
      return <Navigate to="/scripts" replace />;
    }
  }
  
  return <>{children}</>;
};

export default AuthGuard;
