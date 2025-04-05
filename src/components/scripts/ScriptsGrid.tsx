
import React from "react";
import ScriptCard from "./ScriptCard";
import { ScriptVisibility } from "@/services/ScriptService";

interface ScriptData {
  id: string;
  title: string;
  author: string;
  visibility?: ScriptVisibility;
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {scripts.map((script) => (
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
  );
};

export default ScriptsGrid;
