
import React from "react";
import { useScript } from "@/contexts/ScriptContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import { Input } from "@/components/ui/input";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { Save, FileDown, Plus, List, LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ScriptHeader: React.FC = () => {
  const { title, setTitle, author, setAuthor, addScene, saveScript, loading } = useScript();
  const { user, signOut } = useFirebase();
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    await saveScript();
  };
  
  const handleViewScripts = () => {
    navigate("/scripts");
  };
  
  const handleLogin = () => {
    navigate("/login");
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="p-4 border-b sticky top-0 bg-background z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold border-none shadow-none hover:bg-muted focus:bg-muted px-2 rounded"
            placeholder="Screenplay Title"
          />
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="text-sm text-muted-foreground border-none shadow-none hover:bg-muted focus:bg-muted px-2 rounded"
            placeholder="Author Name"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          {user ? (
            <>
              <Button variant="outline" size="sm" onClick={handleViewScripts}>
                <List className="h-4 w-4 mr-2" />
                My Scripts
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <div className="flex items-center ml-2 text-sm">
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{user.displayName || user.email}</span>
              </div>
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
      <div className="flex justify-between items-center">
        <Button onClick={addScene} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Scene
        </Button>
      </div>
    </div>
  );
};

export default ScriptHeader;
