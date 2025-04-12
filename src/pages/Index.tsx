
import React, { useEffect } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import ScriptEditor from "@/components/ScriptEditor";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useScript } from "@/contexts/ScriptContext";
import { useToast } from "@/hooks/use-toast";

const Index: React.FC = () => {
  const { user, loading: authLoading } = useFirebase();
  const { currentScriptId, setCurrentScriptId, resetScript, loading: scriptLoading } = useScript();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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
        } else if (scriptIdFromState) {
          console.log("Loading script from state ID:", scriptIdFromState);
          // If script ID is provided in navigation state, use it
          setCurrentScriptId(scriptIdFromState);
        } else if (!currentScriptId) {
          console.log("No script ID found, creating new script");
          // Reset to a blank script when coming to the editor without a script ID
          resetScript();
        }
      }
    };
    
    checkScriptAndRedirect();
  }, [currentScriptId, scriptIdFromState, navigate, authLoading, location.pathname, location.state, resetScript, setCurrentScriptId]);
  
  // Update document title with app name
  useEffect(() => {
    document.title = "Scriptly - Screenplay Editor";
  }, []);
  
  console.log("Rendering editor component", {
    currentScriptId,
    scriptIdFromState,
    scriptLoading,
    authLoading
  });
  
  return (
    <div className="bg-background">
      <ScriptEditor />
    </div>
  );
};

export default Index;
