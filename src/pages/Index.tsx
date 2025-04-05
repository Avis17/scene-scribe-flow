
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
        if (!currentScriptId) {
          console.log("No script selected, creating a new script");
          // Reset to a blank script when coming to the editor without a script ID
          resetScript();
        }
      }
    };
    
    checkScriptAndRedirect();
  }, [currentScriptId, navigate, authLoading, location.pathname, resetScript]);
  
  // Update document title with app name
  useEffect(() => {
    document.title = "Scriptly - Screenplay Editor";
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <ScriptEditor />
    </div>
  );
};

export default Index;
