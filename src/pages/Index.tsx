
import React, { useEffect, useState, useRef } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import ScriptEditor from "@/components/ScriptEditor";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useScript } from "@/contexts/ScriptContext";
import { useToast } from "@/hooks/use-toast";
import { Loader, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const { user, loading: authLoading } = useFirebase();
  const { 
    currentScriptId, 
    setCurrentScriptId, 
    resetScript, 
    loading: scriptLoading,
    title,
    loadError
  } = useScript();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [pageState, setPageState] = useState<"new" | "edit" | "loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);

  // Extract scriptId from URL if present in state
  const scriptIdFromState = location.state?.scriptId;
  const loadAttemptRef = useRef(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef(true);
  
  // Cleanup function to clear any timeouts
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Effect to handle script ID and loading status
  useEffect(() => {
    console.log("Index component mounted/updated");
    console.log("Current script ID:", currentScriptId);
    console.log("Script ID from state:", scriptIdFromState);
    
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      
      // Only process if we're not already loading auth
      if (!authLoading && location.pathname === "/editor") {
        console.log("Checking script status for editor page");
        
        // Check if we have forceNew flag from navigation state
        const isNewScriptRequest = location.state?.forceNew === true;
        
        if (isNewScriptRequest) {
          console.log("Force new script requested, resetting script");
          // User explicitly wants a new script
          resetScript();
          setPageState("new");
        } else if (scriptIdFromState) {
          console.log("Loading script from state ID:", scriptIdFromState);
          // If script ID is provided in navigation state, use it
          if (currentScriptId !== scriptIdFromState) {
            setCurrentScriptId(scriptIdFromState);
          }
          setPageState("loading");
          setLoadStartTime(Date.now());
        } else if (!currentScriptId) {
          console.log("No script ID found, creating new script");
          // Reset to a blank script when coming to the editor without a script ID
          resetScript();
          setPageState("new");
        }
      }
    }
  }, [authLoading, location.pathname, location.state, resetScript, scriptIdFromState, currentScriptId, setCurrentScriptId]);
  
  // Update document title based on whether we're creating or editing
  useEffect(() => {
    if (pageState === "new") {
      document.title = "Scriptly - Create New Screenplay";
    } else if (pageState === "edit" && title) {
      document.title = `Scriptly - Editing: ${title}`;
    } else {
      document.title = "Scriptly - Screenplay Editor";
    }
  }, [pageState, title]);
  
  // Handle loading state changes and script data
  useEffect(() => {
    // If we're loading, set a timeout to prevent indefinite loading
    if (scriptLoading && pageState !== "error") {
      console.log("Script is loading, updating page state");
      setPageState("loading");
      
      if (loadStartTime === 0) {
        setLoadStartTime(Date.now());
      }
      
      // Set a master timeout to prevent indefinite loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        if (scriptLoading) {
          console.log("Master loading timeout reached, forcing error state");
          setPageState("error");
          setErrorMessage("Loading timed out. Please try again later.");
        }
      }, 20000); // 20 second maximum loading time
    } 
    // If we have an error from ScriptContext
    else if (loadError) {
      console.log("Load error detected:", loadError);
      setErrorMessage(loadError);
      setPageState("error");
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    } 
    // Script loaded successfully
    else if (!scriptLoading && currentScriptId) {
      console.log("Script finished loading, updating page state to edit");
      setPageState("edit");
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    } 
    // Handle explicit error state from navigation
    else if (location.state?.error) {
      setErrorMessage(location.state.error);
      setPageState("error");
    }
  }, [scriptLoading, loadError, location.state, currentScriptId, pageState, loadStartTime]);

  const handleRetry = () => {
    loadAttemptRef.current = 0;
    setPageState("loading");
    setLoadStartTime(Date.now());
    
    // Force a complete reset of the loading process
    const idToLoad = scriptIdFromState || currentScriptId;
    setCurrentScriptId(null);
    
    setTimeout(() => {
      if (idToLoad) {
        setCurrentScriptId(idToLoad);
      } else {
        // If no script ID, go to new script mode
        resetScript();
        setPageState("new");
      }
    }, 500);
  };
  
  const handleCreateNew = () => {
    resetScript();
    navigate('/editor', { state: { forceNew: true } });
  };
  
  const goToScripts = () => {
    navigate('/scripts');
  };
  
  console.log("Rendering editor component", {
    currentScriptId,
    scriptIdFromState,
    scriptLoading,
    authLoading,
    pageState
  });
  
  if (pageState === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-semibold mb-2">Error Loading Script</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          {errorMessage || "There was a problem loading your screenplay. The script may have been deleted or you don't have access to it."}
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button variant="default" onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={handleCreateNew}>
            Create New Script
          </Button>
          <Button variant="secondary" onClick={goToScripts}>
            Go to My Scripts
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background min-h-screen">
      {scriptLoading || pageState === "loading" ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <Loader className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-4 text-lg font-medium">
            {pageState === "edit" ? "Loading script..." : "Preparing editor..."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {scriptIdFromState && `Script ID: ${scriptIdFromState}`}
          </p>
          {loadAttemptRef.current > 0 && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                Loading attempt: {loadAttemptRef.current}/3
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={handleRetry}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry Now
              </Button>
            </div>
          )}
        </div>
      ) : (
        <ScriptEditor mode={pageState === "new" ? "create" : "edit"} />
      )}
    </div>
  );
};

export default Index;
