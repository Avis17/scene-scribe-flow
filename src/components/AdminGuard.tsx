
import React, { useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/hooks/use-toast';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user, loading: authLoading } = useFirebase();
  const { toast } = useToast();
  
  // Use useCallback to prevent unnecessary re-renders
  const showAccessDeniedToast = useCallback(() => {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
  }, [toast]);
  
  useEffect(() => {
    if (!authLoading && !adminLoading && user && !isAdmin) {
      showAccessDeniedToast();
    }
  }, [isAdmin, user, authLoading, adminLoading, showAccessDeniedToast]);
  
  // While loading, show spinner
  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // If user is not admin, redirect to scripts
  if (!isAdmin) {
    return <Navigate to="/scripts" replace />;
  }
  
  return <>{children}</>;
};

export default AdminGuard;
