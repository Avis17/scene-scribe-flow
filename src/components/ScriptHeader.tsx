
import React from "react";
import { useScript } from "@/contexts/ScriptContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import { Input } from "@/components/ui/input";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { Save, FileDown, Plus, List, LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; 
import HelpDialog from "./HelpDialog";

const ScriptHeader: React.FC = () => {
  const { title, setTitle, author, setAuthor, addScene, saveScript, loading, scenes } = useScript();
  const { user, signOut } = useFirebase();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await saveScript();
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save script",
        variant: "destructive",
      });
    }
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
  
  const handleExport = () => {
    // Generate a PDF from the current script
    try {
      exportScriptToPDF();
      toast({
        title: "Success",
        description: "Script exported successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export script",
        variant: "destructive",
      });
    }
  };
  
  const exportScriptToPDF = () => {
    // Create a styled HTML string representation of the script
    let content = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Courier, monospace; margin: 60px; line-height: 1.6; }
            h1 { text-align: center; margin-bottom: 4px; }
            .author { text-align: center; margin-bottom: 50px; }
            .scene-heading { font-weight: bold; text-transform: uppercase; margin-top: 20px; }
            .action { margin: 10px 0; }
            .character { margin-left: 20%; margin-bottom: 0; margin-top: 20px; font-weight: bold; }
            .dialogue { margin-left: 10%; margin-right: 20%; margin-bottom: 20px; }
            .parenthetical { margin-left: 15%; margin-bottom: 0; font-style: italic; }
            .transition { margin-left: 60%; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="author">by ${author}</p>
    `;
    
    // Add each scene to the content
    scenes.forEach((scene, sceneIndex) => {
      scene.elements.forEach((element) => {
        content += `<div class="${element.type}">${element.content}</div>`;
      });
    });
    
    content += `
        </body>
      </html>
    `;
    
    // Create an invisible iframe to print from
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'absolute';
    printIframe.style.top = '-9999px';
    document.body.appendChild(printIframe);
    
    const contentWindow = printIframe.contentWindow;
    if (contentWindow) {
      contentWindow.document.open();
      contentWindow.document.write(content);
      contentWindow.document.close();
      
      // Wait for content to load before printing
      setTimeout(() => {
        contentWindow.focus();
        contentWindow.print();
        document.body.removeChild(printIframe);
      }, 250);
    }
  };

  return (
    <div className="p-4 border-b sticky top-0 bg-background z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button onClick={addScene} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Scene
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <HelpDialog />
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
      <div className="flex flex-col space-y-2 max-w-3xl mx-auto">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-bold border-none shadow-none hover:bg-muted focus:bg-muted px-2 rounded text-center"
          placeholder="Screenplay Title"
        />
        <Input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="text-sm text-muted-foreground border-none shadow-none hover:bg-muted focus:bg-muted px-2 rounded text-center"
          placeholder="Author Name"
        />
      </div>
    </div>
  );
};

export default ScriptHeader;
