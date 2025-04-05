
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, FileLock, Edit, FileDown, Trash2 } from "lucide-react";
import { ScriptVisibility } from "@/services/ScriptService";

interface ScriptData {
  id: string;
  title: string;
  author: string;
  visibility?: ScriptVisibility;
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
}

interface ScriptCardProps {
  script: ScriptData;
  onOpen: (scriptId: string) => void;
  onDelete: (scriptId: string) => void;
  onExport: (scriptId: string, title: string) => void;
  formatDate: (date: Date) => string;
}

const ScriptCard: React.FC<ScriptCardProps> = ({ 
  script, 
  onOpen, 
  onDelete, 
  onExport, 
  formatDate 
}) => {
  return (
    <Card 
      key={script.id} 
      className={`hover:shadow-md transition-shadow ${
        script.visibility === "protected" ? "border-2 border-primary" : ""
      }`}
    >
      <CardHeader onClick={() => onOpen(script.id)} className="cursor-pointer">
        <CardTitle className="flex items-center">
          {script.visibility === "protected" ? (
            <FileLock className="h-5 w-5 mr-2 text-primary" />
          ) : (
            <File className="h-5 w-5 mr-2" />
          )}
          {script.title || "Untitled Screenplay"}
        </CardTitle>
        <CardDescription>
          {script.author || "Unknown Author"}
          {script.visibility === "protected" && (
            <span className="ml-2 text-xs bg-primary/20 p-1 rounded-sm text-primary">
              Protected
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 cursor-pointer" onClick={() => onOpen(script.id)}>
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(script.updatedAt.toDate())}
        </p>
        <p className="text-sm text-muted-foreground">
          Created: {formatDate(script.createdAt.toDate())}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onOpen(script.id)}
            type="button"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => onExport(script.id, script.title)}
            className="mr-2"
            type="button"
          >
            <FileDown className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onDelete(script.id)}
          className="ml-2"
          type="button"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScriptCard;
