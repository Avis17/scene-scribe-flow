
import React, { useEffect, useState } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import ScriptEditor from "@/components/ScriptEditor";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useScript } from "@/contexts/ScriptContext";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

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
  const [pageState, setPageState] = useState<"new" | "edit" | "loading">("loading");

  // Extract scriptId from URL if present in state
  const scriptIdFromState = location.state?.scriptId;
  
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
  
  console.log("Rendering editor component", {
    currentScriptId,
    scriptIdFromState,
    scriptLoading,
    authLoading,
    pageState
  });
  
  return (
    <div className="bg-background min-h-screen">
      {scriptLoading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <Loader className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-4 text-lg font-medium">
            {pageState === "edit" ? "Loading script..." : "Preparing editor..."}
          </p>
        </div>
      ) : (
        <ScriptEditor mode={pageState === "new" ? "create" : "edit"} />
      )}
    </div>
  );
};

export default Index;
