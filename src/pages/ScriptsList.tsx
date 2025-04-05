import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { ScrollText, Share2, UsersRound, BookOpen } from "lucide-react";

interface ScriptData {
  id: string;
  title: string;
  author: string;
  lastEditedBy?: string;
  visibility?: ScriptVisibility;
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
  userId?: string;
  sharedWith?: Record<string, any>;
}

const ADMIN_EMAIL = "studio.semmaclicks@gmail.com";

const ScriptsList: React.FC = () => {
  const [scripts, setScripts] = useState<ScriptData[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<ScriptData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ownScriptsCount, setOwnScriptsCount] = useState<number>(0);
  const [sharedScriptsCount, setSharedScriptsCount] = useState<number>(0);
  const [isViewingAll, setIsViewingAll] = useState<boolean>(false);
  const fetchInProgress = useRef<boolean>(false);
  const initialLoadComplete = useRef<boolean>(false);
  
  const { user } = useFirebase();
  const scriptService = useScriptService();
  const { setCurrentScriptId, resetScript } = useScript();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Direct admin check without relying on AdminContext
  const isAdminUser = user?.email === ADMIN_EMAIL;

  console.log("ScriptsList - User email:", user?.email, "isAdmin:", isAdminUser);
  
  // Modified fetchScripts to better handle the admin fetch and prevent multiple fetches
  const fetchScripts = useCallback(async (fetchAll = false) => {
    if (!user || fetchInProgress.current) return;
    
    try {
      console.log("Fetching scripts for", user.email, "isAdmin:", isAdminUser, "viewingAll:", fetchAll);
      fetchInProgress.current = true;
      setLoading(true);
      
      let userScripts;
      
      if (fetchAll && isAdminUser) {
        console.log("Attempting to fetch ALL scripts as admin user:", user.email);
        userScripts = await scriptService.getAllScripts();
        console.log("Admin fetch returned scripts:", userScripts.length);
        setIsViewingAll(true);
      } else {
        userScripts = await scriptService.getUserScripts(false);
        setIsViewingAll(false);
      }
      
      console.log("All fetched scripts (including shared):", userScripts.length);
      
      if (!fetchAll) {
        const ownScripts = userScripts.filter(script => script.userId === user.uid);
        const sharedScripts = userScripts.filter(script => 
          script.userId !== user.uid && 
          script.sharedWith && 
          user.email && 
          script.sharedWith[user.email]
        );
        
        setOwnScriptsCount(ownScripts.length);
        setSharedScriptsCount(sharedScripts.length);
      } else {
        // When viewing all scripts as admin, there's no need to calculate own/shared counts
        setOwnScriptsCount(0);
        setSharedScriptsCount(0);
      }
      
      // Set both states at once to avoid multiple renders
      setScripts(userScripts);
      setFilteredScripts(userScripts);
      initialLoadComplete.current = true;
    } catch (error) {
      console.error("Error fetching scripts:", error);
      toast({
        title: "Error",
        description: "Failed to load scripts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      // Add a small delay before allowing new fetches to prevent rapid consecutive calls
      setTimeout(() => {
        fetchInProgress.current = false;
      }, 500);
    }
  }, [user, scriptService, toast, isAdminUser]);

  // Use a more stable effect for initial loading with cleanup
  useEffect(() => {
    // Only run this effect once when user is available and initial load is not complete
    if (user && !initialLoadComplete.current && !fetchInProgress.current) {
      fetchScripts(isViewingAll);
    }
    
    // Cleanup function
    return () => {
      // No cleanup needed
    };
  }, [user, fetchScripts, isViewingAll]);

  // Separate effect for search to avoid triggering fetchScripts
  useEffect(() => {
    if (scripts.length > 0) {
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
    }
  }, [searchQuery, scripts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteScript = async (scriptId: string) => {
    try {
      await scriptService.deleteScript(scriptId);
      
      const updatedScripts = scripts.filter(script => script.id !== scriptId);
      setScripts(updatedScripts);
      setFilteredScripts(prevFiltered => 
        prevFiltered.filter(script => script.id !== scriptId)
      );
      
      const ownScripts = updatedScripts.filter(script => script.userId === user?.uid);
      const sharedScripts = updatedScripts.filter(script => 
        script.userId !== user?.uid && 
        script.sharedWith && 
        user?.email && 
        script.sharedWith[user?.email]
      );
      
      setOwnScriptsCount(ownScripts.length);
      setSharedScriptsCount(sharedScripts.length);
      
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
    navigate("/editor");
  };

  const handleCreateNew = () => {
    resetScript();
    navigate("/editor", { state: { forceNew: true } });
  };

  const handleExportPDF = async (scriptId: string, title: string) => {
    try {
      const scriptData = await scriptService.getScriptById(scriptId);
      if (!scriptData) {
        throw new Error("Script not found");
      }
      
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

  const handleViewAllScripts = () => {
    console.log("Viewing all scripts clicked by admin:", user?.email);
    
    if (!fetchInProgress.current) {
      setIsViewingAll(true);
      setLoading(true);
      fetchScripts(true);
    }
  };

  const handleViewMyScripts = () => {
    console.log("Viewing my scripts clicked by admin:", user?.email);
    
    if (!fetchInProgress.current) {
      setIsViewingAll(false);
      setLoading(true);
      fetchScripts(false);
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
      <div className="p-6 pb-20 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 mb-6">
            <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
            <div className="relative">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">Scriptly - Your Scripts</h1>
              <p className="text-md text-slate-700 dark:text-slate-300 mb-6">
                Manage and share your scripts with others
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                {isAdminUser && (
                  <>
                    <Button 
                      onClick={isViewingAll ? handleViewMyScripts : handleViewAllScripts}
                      variant="secondary"
                      className="flex items-center gap-2"
                      disabled={loading}
                    >
                      <BookOpen className="h-4 w-4" />
                      {isViewingAll ? "View My Scripts" : "View All Screenplays"}
                      {loading && <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>}
                    </Button>
                    {/* Add debug information for admin user */}
                    <p className="bg-amber-100 text-amber-800 p-2 rounded text-sm">
                      Admin user detected: {user?.email}
                    </p>
                  </>
                )}
              </div>
              
              {!isViewingAll && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <ScrollText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Total Scripts</p>
                      <p className="text-2xl font-bold">{ownScriptsCount + sharedScriptsCount}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900">
                      <ScrollText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">My Scripts</p>
                      <p className="text-2xl font-bold">{ownScriptsCount}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                      <UsersRound className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Shared With Me</p>
                      <p className="text-2xl font-bold">{sharedScriptsCount}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {isViewingAll && (
                <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-300 dark:border-amber-700 mt-4">
                  <h2 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Viewing All Screenplays {loading ? '(Loading...)' : `(${filteredScripts.length})`}
                  </h2>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    You are viewing all screenplays in the system. These scripts are read-only.
                  </p>
                </div>
              )}
            </div>
          </div>
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
            isViewOnly={isViewingAll}
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
