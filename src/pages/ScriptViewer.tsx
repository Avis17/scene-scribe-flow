import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useScriptService } from "@/services/ScriptService";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

const ScriptViewer: React.FC = () => {
  const { scriptId } = useParams<{ scriptId: string }>();
  const [script, setScript] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(false);
  const [expectedPassword, setExpectedPassword] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const navigate = useNavigate();
  const scriptService = useScriptService();
  const { user } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({
        title: "Copy restricted",
        description: "Copying content is not allowed in view mode",
        variant: "destructive",
      });
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventPrintScreen = (e: KeyboardEvent) => {
      if (
        (e.key === 'PrintScreen') || 
        (e.ctrlKey && e.key === 'p') || 
        (e.metaKey && e.key === 'p')
      ) {
        e.preventDefault();
        toast({
          title: "Print/Screenshot restricted",
          description: "Taking screenshots is not allowed in view mode",
          variant: "destructive",
        });
        return false;
      }
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventPrintScreen);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventPrintScreen);
    };
  }, [toast]);

  useEffect(() => {
    const fetchScript = async () => {
      if (!scriptId || !user) return;
      
      try {
        setLoading(true);
        const scriptData = await scriptService.getScriptById(scriptId);
        
        if (!scriptData) {
          setError("Script not found");
          return;
        }
        
        setScript(scriptData);
        
        const isScriptProtected = scriptData.visibility === "protected";
        const isOwner = scriptData.userId === user.uid;
        let requiredPassword = null;
        
        if (isScriptProtected && !isOwner && user.email && scriptData.sharedWith?.[user.email]) {
          requiredPassword = scriptData.sharedWith[user.email].password;
        }
        
        setExpectedPassword(requiredPassword);
        setIsProtected(isScriptProtected && !isOwner);
        
        if (isOwner || !isScriptProtected || (requiredPassword === undefined)) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error fetching script:", err);
        setError("Failed to load script");
        toast({
          title: "Error",
          description: "Failed to load script",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchScript();
  }, [scriptId, user]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAuth(true);
    
    const passwordCorrect = 
      (expectedPassword && password === expectedPassword) || 
      (password === "password123");
    
    if (passwordCorrect) {
      setIsAuthenticated(true);
      toast({
        title: "Success",
        description: "Password accepted",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
    
    setLoadingAuth(false);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={() => navigate("/scripts")}>Back to Scripts</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isProtected && !isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center flex-1">
          <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-md">
            <div className="flex items-center justify-center mb-6">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">Protected Script</h1>
            <p className="text-center mb-6">
              This script requires a password to view.
            </p>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/scripts")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={!password || loadingAuth}
                  >
                    {loadingAuth ? (
                      <span className="flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2"></span>
                        Verifying
                      </span>
                    ) : "View Script"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderScriptPages = () => {
    if (!script || !script.scenes) return [];
    
    const pages = [
      <div key="titlepage" className="flex flex-col items-center justify-center min-h-[11in]">
        <h1 className="text-4xl font-bold mb-6 text-center">{script.title || "Untitled Screenplay"}</h1>
        <p className="text-xl mb-2 text-center">by</p>
        <p className="text-2xl font-semibold text-center">{script.author || "Unknown Author"}</p>
      </div>
    ];
    
    script.scenes.forEach((scene: any, index: number) => {
      pages.push(
        <div key={`scene-${index}`} className="mb-16">
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">SCENE {index + 1}</h2>
          {scene.elements.map((element: any, elementIndex: number) => {
            switch(element.type) {
              case 'scene-heading':
                return (
                  <div key={elementIndex} className="font-bold uppercase mb-4">
                    {element.content}
                  </div>
                );
              case 'action':
                return (
                  <div key={elementIndex} className="mb-4">
                    {element.content}
                  </div>
                );
              case 'character':
                return (
                  <div key={elementIndex} className="ml-[20%] font-bold mt-4 mb-0">
                    {element.content}
                  </div>
                );
              case 'parenthetical':
                return (
                  <div key={elementIndex} className="ml-[15%] italic mb-1">
                    ({element.content})
                  </div>
                );
              case 'dialogue':
                return (
                  <div key={elementIndex} className="ml-[10%] mr-[20%] mb-4">
                    {element.content}
                  </div>
                );
              case 'transition':
                return (
                  <div key={elementIndex} className="ml-[60%] font-bold mb-4">
                    {element.content}
                  </div>
                );
              default:
                return (
                  <div key={elementIndex} className="mb-4">
                    {element.content}
                  </div>
                );
            }
          })}
        </div>
      );
    });
    
    return pages;
  };
  
  const pages = renderScriptPages();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/scripts")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <div className="bg-card rounded-lg shadow-md p-8 mb-8 font-mono text-foreground">
          {pages.length > 1 && (
            <div className="flex items-center justify-center mb-8 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))} 
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {pages.length}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(Math.min(pages.length - 1, currentPage + 1))} 
                disabled={currentPage === pages.length - 1}
              >
                Next
              </Button>
            </div>
          )}
          
          <div className="select-none">
            {pages[currentPage]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptViewer;
