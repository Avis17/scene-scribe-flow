
import React, { useState, useEffect } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilePlus, LogIn, LogOut, User, Search, Home, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import HelpDialog from "./HelpDialog";
import { useScript } from "@/contexts/ScriptContext";

interface AppHeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ showSearch = false, onSearch }) => {
  const { user, signOut } = useFirebase();
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const { resetScript } = useScript();
  const [adminReady, setAdminReady] = useState(false);
  
  // Add a delay to ensure admin status is stable before showing admin features
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setAdminReady(true);
      }, 500); // Short delay to ensure stability
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  // Only show admin button when isAdmin is true and loading is complete and adminReady is true
  const showAdminButton = isAdmin && !loading && adminReady;
  
  useEffect(() => {
    if (user) {
      console.log("AppHeader - Current user:", user.email);
      console.log("AppHeader - Is admin:", isAdmin, "loading:", loading);
    }
  }, [user, isAdmin, loading]);
  
  const handleLogin = () => {
    navigate("/login");
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };
  
  const handleCreateNew = () => {
    resetScript();
    navigate("/");
  };

  const handleGoHome = () => {
    navigate("/scripts");
  };

  const handleGoToAdmin = () => {
    navigate("/admin");
  };
  
  return (
    <div className="p-4 border-b sticky top-0 bg-background z-10">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="font-bold text-primary text-lg mr-4">Scriptly</div>
          <Button variant="outline" size="sm" onClick={handleGoHome} type="button">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button onClick={handleCreateNew} type="button">
            <FilePlus className="h-4 w-4 mr-2" />
            New Script
          </Button>
          {showAdminButton && (
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
                {showAdminButton && <span className="ml-1 text-xs bg-amber-200 p-1 rounded text-amber-700">Admin</span>}
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
