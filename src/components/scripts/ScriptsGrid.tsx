
import React from "react";
import { ScriptData } from "@/services/ScriptService";
import ScriptCard from "./ScriptCard";
import SharedScriptCard from "./SharedScriptCard";
import { useFirebase } from "@/contexts/FirebaseContext";

interface ScriptsGridProps {
  scripts: ScriptData[];
  onOpenScript: (scriptId: string) => void;
  onDeleteScript: (scriptId: string) => void;
  onExportScript: (scriptId: string, title: string) => void;
  formatDate: (date: Date) => string;
  isViewOnly?: boolean;
  isDeleting?: boolean;
  deletingScriptId?: string | null;
}

const ScriptsGrid: React.FC<ScriptsGridProps> = ({
  scripts,
  onOpenScript,
  onDeleteScript,
  onExportScript,
  formatDate,
  isViewOnly = false,
  isDeleting = false,
  deletingScriptId = null
}) => {
  const { user } = useFirebase();

  // Sort scripts by updatedAt (newest first)
  const sortedScripts = [...scripts].sort((a, b) => {
    return b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime();
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedScripts.map((script) => {
        // Check if the script is owned by the current user or has no user ID
        const isOwnScript = !script.userId || script.userId === user?.uid;
        
        if (isViewOnly || isOwnScript) {
          return (
            <ScriptCard
              key={script.id}
              script={script}
              onOpen={onOpenScript}
              onDelete={onDeleteScript}
              onExport={onExportScript}
              formatDate={formatDate}
              isDeleting={isDeleting && deletingScriptId === script.id}
            />
          );
        } else {
          return (
            <SharedScriptCard
              key={script.id}
              script={script}
              onOpen={onOpenScript}
              onExport={onExportScript}
              formatDate={formatDate}
            />
          );
        }
      })}
    </div>
  );
};

export default ScriptsGrid;
