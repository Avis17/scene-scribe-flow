
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, FileLock, Edit, FileDown, Trash2, Share2, Eye, Clock, User, History } from "lucide-react";
import { ScriptVisibility } from "@/services/ScriptService";
import ShareScriptDialog from "./ShareScriptDialog";
import { useNavigate } from "react-router-dom";
import ScriptVersionHistory from "./ScriptVersionHistory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ScriptData {
  id: string;
  title: string;
  author: string;
  lastEditedBy?: string;
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  
  const handleView = () => {
    navigate(`/view/${script.id}`);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    onDelete(script.id);
    setShowDeleteDialog(false);
  };

  // Extract name from email if it's an email address
  const getDisplayName = (emailOrName: string) => {
    if (emailOrName?.includes('@')) {
      return emailOrName.split('@')[0];
    }
    return emailOrName;
  };

  const lastEditedByDisplay = script.lastEditedBy ? getDisplayName(script.lastEditedBy) : "you";

  return (
    <>
      <Card 
        key={script.id} 
        className={`hover:shadow-md transition-shadow ${
          script.visibility === "protected" ? "border-2 border-primary" : ""
        }`}
      >
        <CardHeader onClick={() => onOpen(script.id)} className="cursor-pointer">
          <CardTitle className="flex items-center flex-wrap gap-2">
            {script.visibility === "protected" ? (
              <FileLock className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
            ) : (
              <File className="h-5 w-5 mr-1 flex-shrink-0" />
            )}
            <span className="truncate">{script.title || "Untitled Screenplay"}</span>
          </CardTitle>
          <CardDescription>
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate">{script.author || "Unknown Author"}</span>
              {script.visibility === "protected" && (
                <span className="text-xs bg-primary/20 p-1 px-2 rounded-sm text-primary whitespace-nowrap">
                  Protected
                </span>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2 cursor-pointer" onClick={() => onOpen(script.id)}>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Last updated: {formatDate(script.updatedAt.toDate())}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Last edited by: {lastEditedByDisplay}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Created: {formatDate(script.createdAt.toDate())}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="grid grid-cols-2 gap-2 w-full">
            {/* View button */}
            <Button 
              variant="outline"
              size="sm"
              onClick={handleView}
              type="button"
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-1" />
              <span>View</span>
            </Button>
            
            {/* Edit button */}
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onOpen(script.id)}
              type="button"
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-1" />
              <span>Edit</span>
            </Button>
            
            {/* Export button */}
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onExport(script.id, script.title)}
              type="button"
              className="w-full"
            >
              <FileDown className="h-4 w-4 mr-1" />
              <span>Export</span>
            </Button>
            
            {/* Delete button */}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={confirmDelete}
              type="button"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span>Delete</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setShowShareDialog(true)}
              type="button"
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span>Share</span>
            </Button>

            <ScriptVersionHistory scriptId={script.id} />
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{script.title || "Untitled Script"}" and remove it from your scripts list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ScriptCard;
