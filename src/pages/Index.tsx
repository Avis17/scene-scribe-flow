
import React, { useEffect, useState, useRef } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import ScriptEditor from "@/components/ScriptEditor";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useScript } from "@/contexts/ScriptContext";
import { useToast } from "@/hooks/use-toast";
import { Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const { user, loading: authLoading } = useFirebase();
  const { 
    currentScriptId, 
    setCurrentScriptId, 
    resetScript, 
    loading: scriptLoading,
    title
  } = useScript();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [pageState, setPageState] = useState<"new" | "edit" | "loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract scriptId from URL if present in state
  const scriptIdFromState = location.state?.scriptId;
  const loadAttemptRef = useRef(0);
  
  useEffect(() => {
    console.log("Index component mounted/updated");
    console.log("Current script ID:", currentScriptId);
    console.log("Script ID from state:", scriptIdFromState);
    
    const checkScriptAndRedirect = () => {
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
          setCurrentScriptId(scriptIdFromState);
          setPageState("edit");
        } else if (!currentScriptId) {
          console.log("No script ID found, creating new script");
          // Reset to a blank script when coming to the editor without a script ID
          resetScript();
          setPageState("new");
        } else {
          // We have a currentScriptId, so we must be editing
          setPageState("edit");
        }
      }
    };
    
    checkScriptAndRedirect();
  }, [currentScriptId, scriptIdFromState, navigate, authLoading, location.pathname, location.state, resetScript, setCurrentScriptId]);
  
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
  
  // Check for loading state changes
  useEffect(() => {
    if (scriptLoading) {
      setPageState("loading");
    } else if (location.state?.error) {
      setErrorMessage(location.state.error);
      setPageState("error");
    } else if (currentScriptId && pageState === "loading") {
      // Script has finished loading, update state to edit
      console.log("Script finished loading, updating page state to edit");
      setPageState("edit");
    }
  }, [scriptLoading, location.state, currentScriptId, pageState]);
  
  // Add timeout for stuck loading state
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (pageState === "loading" && currentScriptId) {
      // If still loading after 10 seconds, check if we should retry
      timeoutId = setTimeout(() => {
        if (pageState === "loading") {
          loadAttemptRef.current += 1;
          console.log("Loading timeout reached, attempt:", loadAttemptRef.current);
          
          if (loadAttemptRef.current < 3) {
            // Try reloading the script
            setCurrentScriptId(null);
            setTimeout(() => {
              if (scriptIdFromState) {
                setCurrentScriptId(scriptIdFromState);
              } else if (currentScriptId) {
                setCurrentScriptId(currentScriptId);
              }
            }, 500);
          } else {
            // After 3 attempts, show error
            setErrorMessage("Script is taking too long to load. Please try again later.");
            setPageState("error");
          }
        }
      }, 10000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pageState, currentScriptId, scriptIdFromState, setCurrentScriptId]);

  const handleRetry = () => {
    loadAttemptRef.current = 0;
    setPageState("loading");
    if (scriptIdFromState) {
      // Try to load the script again
      setCurrentScriptId(null);
      setTimeout(() => {
        setCurrentScriptId(scriptIdFromState);
      }, 500);
    } else {
      // Navigate to scripts list
      navigate('/scripts');
    }
  };
  
  const handleCreateNew = () => {
    resetScript();
    navigate('/editor', { state: { forceNew: true } });
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
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
          <Button onClick={handleCreateNew}>
            Create New Script
          </Button>
          <Button variant="secondary" onClick={() => navigate('/scripts')}>
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
        </div>
      ) : (
        <ScriptEditor mode={pageState === "new" ? "create" : "edit"} />
      )}
    </div>
  );
};

export default Index;
