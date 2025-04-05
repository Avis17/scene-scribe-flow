
import React, { useEffect } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import ScriptEditor from "@/components/ScriptEditor";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  const { user, loading } = useFirebase();
  const navigate = useNavigate();
  
  // We don't force redirect here since ScriptHeader handles login buttons
  // This makes the app usable without login (until saving)
  
  return (
    <div className="min-h-screen bg-background">
      <ScriptEditor />
    </div>
  );
};

export default Index;
