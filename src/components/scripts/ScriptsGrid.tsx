
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

  // Separate own scripts from shared scripts
  const ownScripts = scripts.filter(script => !script.userId || script.userId === user?.uid);
  const sharedScripts = scripts.filter(script => script.userId && script.userId !== user?.uid);

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
