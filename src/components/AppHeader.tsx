
import React from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilePlus, List, LogIn, LogOut, User, Search, Home } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import HelpDialog from "./HelpDialog";

interface AppHeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ showSearch = false, onSearch }) => {
  const { user, signOut } = useFirebase();
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate("/login");
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };
  
  const handleViewScripts = () => {
    navigate("/scripts");
  };
  
  const handleCreateNew = () => {
    navigate("/");
  };

  const handleGoHome = () => {
    navigate("/scripts");
  };
  
  return (
    <div className="p-4 border-b sticky top-0 bg-background z-10">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleGoHome}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button onClick={handleCreateNew}>
            <FilePlus className="h-4 w-4 mr-2" />
            New Script
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewScripts}>
            <List className="h-4 w-4 mr-2" />
            My Scripts
          </Button>
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
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={handleLogin}>
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
