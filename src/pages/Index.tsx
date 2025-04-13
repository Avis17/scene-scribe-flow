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
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

  const scriptIdFromState = location.state?.scriptId;
  const loadAttemptRef = useRef(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef(true);
  
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      
      if (!authLoading && location.pathname === "/editor") {
        console.log("Checking script status for editor page");
        
        const isNewScriptRequest = location.state?.forceNew === true;
        
        if (isNewScriptRequest) {
          console.log("Force new script requested, resetting script");
          resetScript();
          setPageState("new");
          setInitialLoadComplete(true);
        } else if (scriptIdFromState) {
          console.log("Loading script from state ID:", scriptIdFromState);
          if (currentScriptId !== scriptIdFromState) {
            setCurrentScriptId(scriptIdFromState);
          }
          setPageState("loading");
          setLoadStartTime(Date.now());
        } else if (!currentScriptId) {
          console.log("No script ID found, creating new script");
          resetScript();
          setPageState("new");
          setInitialLoadComplete(true);
        }
      }
    }
  }, [authLoading, location.pathname, location.state, resetScript, scriptIdFromState, currentScriptId, setCurrentScriptId]);
  
  useEffect(() => {
    if (pageState === "new") {
      document.title = "Scriptly - Create New Screenplay";
    } else if (pageState === "edit" && title) {
      document.title = `Scriptly - Editing: ${title}`;
    } else {
      document.title = "Scriptly - Screenplay Editor";
    }
  }, [pageState, title]);
  
  useEffect(() => {
    if (!initialLoadComplete) {
      if (scriptLoading && pageState !== "error") {
        console.log("Initial script loading, updating page state");
        setPageState("loading");
        
        if (loadStartTime === 0) {
          setLoadStartTime(Date.now());
        }
        
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        loadingTimeoutRef.current = setTimeout(() => {
          if (scriptLoading) {
            console.log("Master loading timeout reached, forcing error state");
            setPageState("error");
            setErrorMessage("Loading timed out. Please try again later.");
          }
        }, 20000);
      } 
      else if (loadError) {
        console.log("Load error detected:", loadError);
        setErrorMessage(loadError);
        setPageState("error");
        
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      } 
      else if (!scriptLoading && currentScriptId) {
        console.log("Script finished initial loading, updating page state to edit");
        setPageState("edit");
        setInitialLoadComplete(true);
        
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      } 
      else if (location.state?.error) {
        setErrorMessage(location.state.error);
        setPageState("error");
      }
    }
  }, [scriptLoading, loadError, location.state, currentScriptId, pageState, loadStartTime, initialLoadComplete]);
  
  const handleRetry = () => {
    loadAttemptRef.current = 0;
    setPageState("loading");
    setLoadStartTime(Date.now());
    setInitialLoadComplete(false);
    
    const idToLoad = scriptIdFromState || currentScriptId;
    setCurrentScriptId(null);
    
    setTimeout(() => {
      if (idToLoad) {
        setCurrentScriptId(idToLoad);
      } else {
        resetScript();
        setPageState("new");
        setInitialLoadComplete(true);
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
      {(scriptLoading && !initialLoadComplete) || pageState === "loading" ? (
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
