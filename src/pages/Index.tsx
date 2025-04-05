
import React, { useEffect } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import ScriptEditor from "@/components/ScriptEditor";
import { useNavigate, useLocation } from "react-router-dom";
import { useScript } from "@/contexts/ScriptContext";

const Index: React.FC = () => {
  const { user, loading: authLoading } = useFirebase();
  const { currentScriptId, resetScript } = useScript();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const checkScriptAndRedirect = () => {
      // Only redirect if we're not already redirecting or loading auth
      if (!authLoading && location.pathname === "/") {
        console.log("Index - currentScriptId:", currentScriptId);
        console.log("Index - state from location:", location.state);
        
        // Check if we have forceNew flag from navigation state
        const isNewScriptRequest = location.state?.forceNew === true;
        
        if (isNewScriptRequest) {
          console.log("Creating new script as requested");
          resetScript();
        } else if (!currentScriptId) {
          console.log("No script selected, creating a new script");
          // Reset to a blank script when coming to the editor without a script ID
          resetScript();
        }
      }
    };
    
    checkScriptAndRedirect();
  }, [currentScriptId, navigate, authLoading, location.pathname, location.state, resetScript]);
  
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
