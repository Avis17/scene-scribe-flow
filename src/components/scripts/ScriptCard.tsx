
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, FileLock, Edit, FileDown, Trash2, Share2, Eye } from "lucide-react";
import { ScriptVisibility } from "@/services/ScriptService";
import ShareScriptDialog from "./ShareScriptDialog";
import { useNavigate } from "react-router-dom";

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
  const [showShareDialog, setShowShareDialog] = useState(false);
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/view/${script.id}`);
  };

  return (
    <>
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
        <CardFooter className="flex flex-col space-y-2">
          <div className="flex justify-between w-full">
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
                onClick={handleView}
                type="button"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onExport(script.id, script.title)}
                type="button"
              >
                <FileDown className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(script.id)}
                type="button"
              >
                <Trash2 className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </div>
          <div className="w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setShowShareDialog(true)}
              type="button"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Script
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ShareScriptDialog
        scriptId={script.id}
        scriptTitle={script.title || "Untitled Screenplay"} 
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />
    </>
  );
};

export default ScriptCard;
