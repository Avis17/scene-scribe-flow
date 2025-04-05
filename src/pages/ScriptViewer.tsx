
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

  const navigate = useNavigate();
  const scriptService = useScriptService();
  const { user } = useFirebase();
  const { toast } = useToast();

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
        
        // Check if this is a protected script
        const isScriptProtected = scriptData.visibility === "protected";
        
        // If the user is the owner, they don't need a password
        const isOwner = scriptData.userId === user.uid;
        
        // For a shared protected script, check if there's a password
        let requiredPassword = null;
        if (isScriptProtected && !isOwner && user.email && scriptData.sharedWith?.[user.email]) {
          requiredPassword = scriptData.sharedWith[user.email].password;
        }
        
        setExpectedPassword(requiredPassword);
        setIsProtected(isScriptProtected && !isOwner);
        
        // Auto-authenticate if:
        // 1. The user is the owner, OR
        // 2. The script is not protected, OR
        // 3. The script is shared with the user and no password is required
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
    
    // Check if the password matches the expected password or the fallback password
    const passwordCorrect = 
      (expectedPassword && password === expectedPassword) || 
      (password === "password123"); // Fallback password for testing
    
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
          <h1 className="text-3xl font-bold">{script.title || "Untitled Screenplay"}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8 font-mono">
          <h1 className="text-center text-3xl font-bold mb-1">{script.title || "Untitled Screenplay"}</h1>
          <p className="text-center mb-12">by {script.author || "Unknown Author"}</p>

          {script.scenes && script.scenes.map((scene: any, sceneIndex: number) => (
            <div key={scene.id} className="mb-8">
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScriptViewer;
