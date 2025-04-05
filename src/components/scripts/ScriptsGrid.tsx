
import React, { useState } from "react";
import ScriptCard from "./ScriptCard";
import SharedScriptCard from "./SharedScriptCard";
import { ScriptVisibility } from "@/services/ScriptService";
import { useFirebase } from "@/contexts/FirebaseContext";
import { toast } from "@/hooks/use-toast";

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
  // Local state to track scripts after operations like deletion
  const [localScripts, setLocalScripts] = useState<ScriptData[]>(scripts);
  
  // Update local scripts when props change
  React.useEffect(() => {
    setLocalScripts(scripts);
  }, [scripts]);
  
  console.log("ScriptsGrid - Received scripts:", localScripts.length);
  
  // Debug: Print all scripts to see their structure
  localScripts.forEach((script, index) => {
    console.log(`Script ${index}:`, {
      id: script.id,
      title: script.title,
      userId: script.userId,
      currentUserUid: user?.uid,
      sharedWith: script.sharedWith,
      isOwn: script.userId === user?.uid,
      isShared: script.userId !== user?.uid && script.sharedWith && user?.email && 
                script.sharedWith[user.email]
    });
  });

  // Improved filtering logic for own vs shared scripts
  const ownScripts = localScripts.filter(script => script.userId === user?.uid);
  
  // For shared scripts, check if user.email is a key in sharedWith
  const sharedScripts = localScripts.filter(script => {
    if (!script.userId || !user?.email || !script.sharedWith) return false;
    return script.userId !== user?.uid && script.sharedWith[user.email] !== undefined;
  });
  
  console.log("ScriptsGrid - Own scripts:", ownScripts.length, "Shared scripts:", sharedScripts.length);
  
  if (sharedScripts.length > 0) {
    console.log("Example shared script:", {
      title: sharedScripts[0].title,
      userId: sharedScripts[0].userId,
      currentUser: user?.uid,
      sharedWith: Object.keys(sharedScripts[0].sharedWith || {})
    });
  }

  // Custom handler for delete that updates local state first before API call
  const handleDelete = async (scriptId: string) => {
    try {
      // Update local state immediately for responsive UI
      setLocalScripts(prevScripts => prevScripts.filter(script => script.id !== scriptId));
      
      // Call the parent handler to perform the actual deletion
      await onDeleteScript(scriptId);
      
      toast({
        title: "Success",
        description: "Script deleted successfully",
      });
    } catch (error) {
      console.error("Error during script deletion:", error);
      
      // If error occurs, revert the local state change by restoring the scripts from props
      setLocalScripts(scripts);
      
      toast({
        title: "Error",
        description: "Failed to delete script. Please try again.",
        variant: "destructive",
      });
    }
  };

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
                onDelete={handleDelete}
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
