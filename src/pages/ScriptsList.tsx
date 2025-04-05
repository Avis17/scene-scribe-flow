
import React, { useState, useEffect } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useScriptService, ScriptVisibility } from "@/services/ScriptService";
import { useScript } from "@/contexts/ScriptContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import ScriptsGrid from "@/components/scripts/ScriptsGrid";
import LoadingState from "@/components/scripts/LoadingState";
import EmptyState from "@/components/scripts/EmptyState";
import { exportScriptToPDF } from "@/utils/ScriptsExporter";

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
  
  const scriptService = useScriptService();
  const { setCurrentScriptId, resetScript } = useScript();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Effect to fetch scripts when user changes
  useEffect(() => {
    if (user) {
      fetchScripts();
    }
  }, [user]);

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
        // Get all scripts the user has access to (own scripts and shared scripts)
        const userScripts = await scriptService.getUserScripts(false);
        
        // Properly transform and validate script data before setting state
        const validScripts = userScripts
          .filter(script => 
            script && script.id && script.title && 
            (script.author !== undefined) && 
            script.createdAt && script.updatedAt
          )
          .map(script => ({
            id: script.id,
            title: script.title || "Untitled",
            author: script.author || "Unknown",
            visibility: script.visibility as ScriptVisibility,
            createdAt: script.createdAt,
            updatedAt: script.updatedAt
          }));
        
        console.log("Fetched scripts:", validScripts);
        
        setScripts(validScripts);
        setFilteredScripts(validScripts);
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
      
      // Convert the scriptData to match the required format before passing to exportScriptToPDF
      const formattedScriptData = {
        id: scriptData.id,
        title: scriptData.title || "Untitled",
        author: scriptData.author || "Unknown",
        scenes: scriptData.scenes || [],
      };
      
      exportScriptToPDF(formattedScriptData);
      
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
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
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
          <p className="text-sm text-muted-foreground mt-1">
            Manage and share your scripts with others
          </p>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredScripts.length > 0 ? (
          <ScriptsGrid 
            scripts={filteredScripts}
            onOpenScript={handleOpenScript}
            onDeleteScript={handleDeleteScript}
            onExportScript={handleExportPDF}
            formatDate={formatDate}
          />
        ) : (
          <EmptyState 
            searchQuery={searchQuery}
            onCreateNew={handleCreateNew}
          />
        )}
      </div>
    </div>
  );
};

export default ScriptsList;
