import React, { useState, useEffect } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useScriptService, ScriptVisibility } from "@/services/ScriptService";
import { useScript } from "@/contexts/ScriptContext";
import { useAdmin } from "@/contexts/AdminContext"; 
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { File, Trash2, Edit, FileDown, FileLock } from "lucide-react";

interface ScriptData {
  id: string;
  title: string;
  author: string;
  visibility?: ScriptVisibility;
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
}

const ScriptsList: React.FC = () => {
  const [scripts, setScripts] = useState<ScriptData[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<ScriptData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { user } = useFirebase();
  const { isAdmin } = useAdmin();
  const scriptService = useScriptService();
  const { setCurrentScriptId, resetScript } = useScript();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchScripts();
  }, [user, isAdmin]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredScripts(scripts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredScripts(
        scripts.filter(
          script => 
            script.title.toLowerCase().includes(query) || 
            script.author.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, scripts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const fetchScripts = async () => {
    try {
      setLoading(true);
      if (user) {
        const userScripts = await scriptService.getUserScripts(isAdmin);
        setScripts(userScripts as ScriptData[]);
        setFilteredScripts(userScripts as ScriptData[]);
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

  const handleDeleteScript = async (scriptId: string) => {
    try {
      await scriptService.deleteScript(scriptId);
      setScripts(prevScripts => prevScripts.filter(script => script.id !== scriptId));
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
    resetScript();
    navigate("/");
  };

  const handleExportPDF = async (scriptId: string, title: string) => {
    try {
      const scriptData = await scriptService.getScriptById(scriptId);
      if (!scriptData) {
        throw new Error("Script not found");
      }
      
      exportScriptToPDF(scriptData);
      
      toast({
        title: "Success",
        description: "Script exported successfully",
      });
    } catch (error) {
      console.error("Error exporting script:", error);
      toast({
        title: "Error",
        description: "Failed to export script",
        variant: "destructive",
      });
    }
  };

  const exportScriptToPDF = (scriptData: any) => {
    let content = `
      <html>
        <head>
          <title>${scriptData.title}</title>
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
          <h1>${scriptData.title}</h1>
          <p class="author">by ${scriptData.author}</p>
    `;
    
    scriptData.scenes.forEach((scene: any, sceneIndex: number) => {
      scene.elements.forEach((element: any) => {
        content += `<div class="${element.type}">${element.content}</div>`;
      });
    });
    
    content += `
        </body>
      </html>
    `;
    
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'absolute';
    printIframe.style.top = '-9999px';
    document.body.appendChild(printIframe);
    
    const contentWindow = printIframe.contentWindow;
    if (contentWindow) {
      contentWindow.document.open();
      contentWindow.document.write(content);
      contentWindow.document.close();
      
      setTimeout(() => {
        contentWindow.focus();
        contentWindow.print();
        document.body.removeChild(printIframe);
      }, 250);
    }
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
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="mb-4">Please log in to view your scripts</p>
            <Button onClick={() => navigate("/login")} type="button">Go to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showSearch={true} onSearch={handleSearch} />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Scriptly - Your Scripts</h1>
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
        ) : filteredScripts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScripts.map((script) => (
              <Card 
                key={script.id} 
                className={`hover:shadow-md transition-shadow ${
                  script.visibility === "protected" ? "border-2 border-primary" : ""
                }`}
              >
                <CardHeader onClick={() => handleOpenScript(script.id)} className="cursor-pointer">
                  <CardTitle className="flex items-center">
                    {script.visibility === "protected" ? (
                      <FileLock className="h-5 w-5 mr-2 text-primary" />
                    ) : (
                      <File className="h-5 w-5 mr-2" />
                    )}
                    {script.title || "Untitled Screenplay"}
                  </CardTitle>
                  <CardDescription>
                    {script.author || "Unknown Author"}
                    {script.visibility === "protected" && (
                      <span className="ml-2 text-xs bg-primary/20 p-1 rounded-sm text-primary">
                        Protected
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 cursor-pointer" onClick={() => handleOpenScript(script.id)}>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {formatDate(script.updatedAt.toDate())}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {formatDate(script.createdAt.toDate())}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenScript(script.id)}
                      type="button"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPDF(script.id, script.title)}
                      className="mr-2"
                      type="button"
                    >
                      <FileDown className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteScript(script.id)}
                    className="ml-2"
                    type="button"
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
              {searchQuery ? "No scripts match your search criteria." : "You haven't created any scripts yet. Get started by creating your first script."}
            </p>
            <Button onClick={handleCreateNew} type="button">
              <File className="mr-2 h-4 w-4" />
              Create New Script
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptsList;
