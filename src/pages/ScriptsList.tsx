
import React, { useState, useEffect } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useScriptService } from "@/services/ScriptService";
import { useScript } from "@/contexts/ScriptContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { File, FilePlus, Trash2, Edit } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface ScriptData {
  id: string;
  title: string;
  author: string;
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
}

const ScriptsList: React.FC = () => {
  const [scripts, setScripts] = useState<ScriptData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { user } = useFirebase();
  const scriptService = useScriptService();
  const { setCurrentScriptId } = useScript();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchScripts();
  }, [user]);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      if (user) {
        const userScripts = await scriptService.getUserScripts();
        setScripts(userScripts as ScriptData[]);
      }
    } catch (error) {
      console.error("Error fetching scripts:", error);
      toast({
        title: "Error",
        description: "Failed to load scripts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScript = async (scriptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await scriptService.deleteScript(scriptId);
      setScripts(scripts.filter(script => script.id !== scriptId));
      toast({
        title: "Success",
        description: "Script deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting script:", error);
      toast({
        title: "Error",
        description: "Failed to delete script",
        variant: "destructive",
      });
    }
  };

  const handleOpenScript = (scriptId: string) => {
    setCurrentScriptId(scriptId);
    navigate("/");
  };

  const handleCreateNew = () => {
    setCurrentScriptId(null);
    navigate("/");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-4">Please log in to view your scripts</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Scripts</h1>
          <div className="flex items-center space-x-2">
            <Button onClick={handleCreateNew}>
              <FilePlus className="mr-2 h-4 w-4" />
              New Script
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : scripts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map((script) => (
              <Card 
                key={script.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleOpenScript(script.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <File className="h-5 w-5 mr-2" />
                    {script.title || "Untitled Screenplay"}
                  </CardTitle>
                  <CardDescription>{script.author || "Unknown Author"}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    Last updated: {formatDate(script.updatedAt.toDate())}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {formatDate(script.createdAt.toDate())}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenScript(script.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => handleDeleteScript(script.id, e)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-medium mb-2">No scripts found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't created any scripts yet. Get started by creating your first script.
            </p>
            <Button onClick={handleCreateNew}>
              <FilePlus className="mr-2 h-4 w-4" />
              Create New Script
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptsList;
