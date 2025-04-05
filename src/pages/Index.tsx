
import React, { useEffect } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import ScriptEditor from "@/components/ScriptEditor";
import { useNavigate, useLocation } from "react-router-dom";
import { useScript } from "@/contexts/ScriptContext";

const Index: React.FC = () => {
  const { user, loading: authLoading } = useFirebase();
  const { currentScriptId } = useScript();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // If we have no script ID selected, redirect to scripts list
    if (!authLoading && !currentScriptId && location.pathname === "/") {
      navigate("/scripts");
    }
  }, [currentScriptId, navigate, authLoading, location.pathname]);
  
  return (
    <div className="min-h-screen bg-background">
      <ScriptEditor />
    </div>
  );
};

export default Index;
