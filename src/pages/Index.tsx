
import React, { useEffect } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import ScriptEditor from "@/components/ScriptEditor";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useScript } from "@/contexts/ScriptContext";
import { useToast } from "@/hooks/use-toast";

const Index: React.FC = () => {
  const { user, loading: authLoading } = useFirebase();
  const { currentScriptId, setCurrentScriptId, resetScript } = useScript();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract scriptId from URL if present in state
  const scriptIdFromState = location.state?.scriptId;
  
  useEffect(() => {
    const checkScriptAndRedirect = () => {
      // Only process if we're not already loading auth
      if (!authLoading && location.pathname === "/editor") {
        // Check if we have forceNew flag from navigation state
        const isNewScriptRequest = location.state?.forceNew === true;
        
        if (isNewScriptRequest) {
          // User explicitly wants a new script
          resetScript();
        } else if (scriptIdFromState) {
          // If script ID is provided in navigation state, use it
          setCurrentScriptId(scriptIdFromState);
        } else if (!currentScriptId) {
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
  
  return (
    <div className="bg-background">
      <ScriptEditor />
    </div>
  );
};

export default Index;
