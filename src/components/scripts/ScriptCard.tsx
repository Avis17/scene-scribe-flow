
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, FileLock, Edit, FileDown, Trash2, Share2, Eye, Users } from "lucide-react";
import { ScriptVisibility, ScriptAccessLevel } from "@/services/ScriptService";
import ShareScriptDialog from "./ShareScriptDialog";
import { useNavigate } from "react-router-dom";
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
  const { user } = useFirebase();
  
  const isSharedWithMe = user?.uid && script.userId && user.uid !== script.userId;
  
  // Determine access level if this is a shared script
  const accessLevel = isSharedWithMe && user?.email && script.sharedWith?.[user.email]
    ? script.sharedWith[user.email].accessLevel as ScriptAccessLevel
    : undefined;
  
  // Only allow editing if the user owns the script or has edit access
  const canEdit = !isSharedWithMe || accessLevel === "edit";
  
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
            {isSharedWithMe && (
              <span className="ml-2 flex items-center text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 p-1 rounded-sm">
                <Users className="h-3 w-3 mr-1" /> 
                Shared with me 
                {accessLevel && (
                  <span className="ml-1">({accessLevel === "edit" ? "Edit" : "View"} access)</span>
                )}
              </span>
            )}
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
                disabled={isSharedWithMe && accessLevel === "view"}
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
                disabled={!canEdit}
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
              disabled={isSharedWithMe}
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
        visibility={script.visibility}
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />
    </>
  );
};

export default ScriptCard;
