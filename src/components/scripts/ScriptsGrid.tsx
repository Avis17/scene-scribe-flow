import React from "react";
import ScriptCard from "./ScriptCard";
import SharedScriptCard from "./SharedScriptCard";
import { ScriptVisibility, ScriptData } from "@/services/ScriptService";
import { useFirebase } from "@/contexts/FirebaseContext";

interface ScriptsGridProps {
  scripts: ScriptData[];
  onOpenScript: (scriptId: string) => void;
  onDeleteScript: (scriptId: string) => void;
  onExportScript: (scriptId: string, title: string) => void;
  formatDate: (date: Date) => string;
  isViewOnly?: boolean;
}

const ScriptsGrid: React.FC<ScriptsGridProps> = ({
  scripts,
  onOpenScript,
  onDeleteScript,
  onExportScript,
  formatDate,
  isViewOnly = false
}) => {
  const { user } = useFirebase();
  
  console.log("ScriptsGrid - Received scripts:", scripts.length);

  // If we're in view-only mode, we show all scripts as read-only
  if (isViewOnly) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-3">All Screenplays (Read Only)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scripts.map((script) => (
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
    );
  }

  // Improved filtering logic for own vs shared scripts
  const ownScripts = scripts.filter(script => script.userId === user?.uid);
  
  // For shared scripts, check if user.email is a key in sharedWith
  const sharedScripts = scripts.filter(script => {
    if (!script.userId || !user?.email || !script.sharedWith) return false;
    return script.userId !== user?.uid && script.sharedWith[user.email] !== undefined;
  });

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

      {ownScripts.length === 0 && sharedScripts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No scripts found.</p>
        </div>
      )}
    </div>
  );
};

export default ScriptsGrid;
