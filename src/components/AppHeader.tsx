
import React, { useState, useEffect } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilePlus, LogIn, LogOut, User, Search, Home, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import HelpDialog from "./HelpDialog";
import AppLogo from "./AppLogo";

interface AppHeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  resetScript?: () => void; // Optional prop for script reset
}

// Define the admin email constant
const ADMIN_EMAIL = "studio.semmaclicks@gmail.com";

const AppHeader: React.FC<AppHeaderProps> = ({ 
  showSearch = false, 
  onSearch,
  resetScript 
}) => {
  const { user, signOut } = useFirebase();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Direct admin check without relying on AdminContext
  const isAdmin = user?.email === ADMIN_EMAIL;
  
  console.log("AppHeader - Current user:", user?.email);
  console.log("AppHeader - Is admin:", isAdmin);
  
  const handleLogin = () => {
    navigate("/login");
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };
  
  const handleCreateNew = () => {
    navigate("/editor", { state: { forceNew: true } });
  };

  const handleGoHome = () => {
    navigate("/scripts");
  };

  const handleGoToAdmin = () => {
    if (location.pathname !== "/admin") {
      navigate("/admin");
    }
  };
  
  return (
    <div className="p-4 border-b sticky top-0 bg-background z-10">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <AppLogo size="md" />
          <Button variant="outline" size="sm" onClick={handleGoHome} type="button">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button onClick={handleCreateNew} type="button">
            <FilePlus className="h-4 w-4 mr-2" />
            New Script
          </Button>
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGoToAdmin} 
              type="button" 
              className="bg-amber-100 hover:bg-amber-200 border-amber-300 transition-all animate-in fade-in duration-300"
            >
              <Shield className="h-4 w-4 mr-2 text-amber-600" />
              Admin
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {showSearch && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scripts..."
                className="pl-8"
                onChange={(e) => onSearch && onSearch(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <HelpDialog />
          {user ? (
            <>
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{user.displayName || user.email}</span>
                {isAdmin && <span className="ml-1 text-xs bg-amber-200 p-1 rounded text-amber-700">Admin</span>}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} type="button">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={handleLogin} type="button">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
