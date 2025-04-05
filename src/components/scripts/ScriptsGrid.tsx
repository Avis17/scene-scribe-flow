
import React from "react";
import ScriptCard from "./ScriptCard";
import SharedScriptCard from "./SharedScriptCard";
import { ScriptVisibility } from "@/services/ScriptService";
import { useFirebase } from "@/contexts/FirebaseContext";

interface ScriptData {
  id: string;
  title: string;
  author: string;
  visibility?: ScriptVisibility;
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
  userId?: string;
  sharedWith?: Record<string, any>;
}

interface ScriptsGridProps {
  scripts: ScriptData[];
  onOpenScript: (scriptId: string) => void;
  onDeleteScript: (scriptId: string) => void;
  onExportScript: (scriptId: string, title: string) => void;
  formatDate: (date: Date) => string;
}

const ScriptsGrid: React.FC<ScriptsGridProps> = ({
  scripts,
  onOpenScript,
  onDeleteScript,
  onExportScript,
  formatDate
}) => {
  const { user } = useFirebase();
  
  console.log("ScriptsGrid - Received scripts:", scripts.length);
  
  // Debug: Print all scripts to see their structure
  scripts.forEach((script, index) => {
    console.log(`Script ${index}:`, {
      id: script.id,
      title: script.title,
      userId: script.userId,
      currentUserUid: user?.uid,
      sharedWith: script.sharedWith,
      isShared: script.userId !== user?.uid && script.sharedWith && user?.email && 
                Object.keys(script.sharedWith).includes(user.email)
    });
  });

  // Fixed filtering logic for own vs shared scripts
  const ownScripts = scripts.filter(script => script.userId === user?.uid);
  
  // For shared scripts, ensure we're correctly checking if user.email is a key in sharedWith
  const sharedScripts = scripts.filter(script => {
    if (!script.userId || !user?.email || !script.sharedWith) return false;
    return script.userId !== user?.uid && Object.keys(script.sharedWith).includes(user.email);
  });
  
  console.log("ScriptsGrid - Own scripts:", ownScripts.length, "Shared scripts:", sharedScripts.length);
  if (sharedScripts.length > 0) {
    console.log("Example shared script:", {
      title: sharedScripts[0].title,
      userId: sharedScripts[0].userId,
      currentUser: user?.uid,
      sharedWith: sharedScripts[0].sharedWith
    });
  }

  return (
    <div className="space-y-6">
      {ownScripts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">My Scripts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownScripts.map((script) => (
              <ScriptCard 
                key={script.id}
                script={script}
                onOpen={onOpenScript}
                onDelete={onDeleteScript}
                onExport={onExportScript}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}

      {sharedScripts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Shared With Me</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedScripts.map((script) => (
              <SharedScriptCard 
                key={script.id}
                script={script}
                onOpen={onOpenScript}
                onExport={onExportScript}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptsGrid;
