
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2, Pencil, X } from "lucide-react";
import { Scene, useScript } from "@/contexts/ScriptContext";
import SceneEditor from "./SceneEditor";
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
import { useToast } from "@/hooks/use-toast";

interface SceneCardProps {
  scene: Scene;
  index: number;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, index }) => {
  const { toggleSceneCollapse, deleteScene, isViewOnly } = useScript();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const getSceneTitle = useCallback(() => {
    const heading = scene.elements.find(
      (element) => element.type === "scene-heading"
    );
    return heading ? heading.content : "Untitled Scene";
  }, [scene.elements]);

  const getScenePreview = useCallback(() => {
    const action = scene.elements.find((element) => element.type === "action");
    return action ? action.content.substring(0, 100) + (action.content.length > 100 ? "..." : "") : "";
  }, [scene.elements]);

  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const confirmDelete = () => {
    setShowDeleteDialog(true);
  };
  
  const handleDelete = () => {
    try {
      deleteScene(scene.id);
      toast({
        title: "Scene deleted",
        description: `Scene ${index + 1} has been removed`
      });
    } catch (error) {
      console.error("Error deleting scene:", error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting the scene",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = () => {
    if (isViewOnly) {
      toast({
        title: "View only mode",
        description: "You cannot edit this script in view-only mode",
        variant: "destructive"
      });
      return;
    }
    console.log("Opening editor for scene:", scene.id);
    setIsEditing(true);
  };

  return (
    <>
      <Card className={`mb-4 border-l-4 ${scene.isCollapsed ? 'border-l-slate-300 dark:border-l-slate-700' : 'border-l-primary'} hover:shadow-md transition-all duration-200 animate-fade-in group`}>
        <CardHeader className="p-3 md:p-4 flex flex-row justify-between items-center flex-wrap gap-2 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base md:text-lg truncate flex items-center">
              <span className="bg-primary/10 dark:bg-primary/20 text-primary px-2 py-0.5 rounded-md text-sm mr-2 font-mono">
                {index + 1}
              </span>
              {getSceneTitle()}
            </div>
            {scene.isCollapsed && (
              <div className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                {getScenePreview()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            {isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                type="button"
              >
                <X className="h-4 w-4" />
                <span className="ml-1 text-xs md:text-sm">Cancel</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                type="button"
                disabled={isViewOnly}
              >
                <Pencil className="h-4 w-4" />
                <span className="ml-1 text-xs md:text-sm">Edit</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={confirmDelete}
              type="button"
              className="hover:text-destructive"
              disabled={isViewOnly}
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-1 text-xs md:text-sm">Delete</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSceneCollapse(scene.id)}
              type="button"
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {scene.isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {!scene.isCollapsed && (
          <CardContent className="p-3 md:p-4 pt-0 bg-white/50 dark:bg-slate-900/50">
            {isEditing ? (
              <SceneEditor scene={scene} onClose={() => setIsEditing(false)} />
            ) : (
              <div className="space-y-2 prose max-w-none pt-4">
                {scene.elements.map((element, i) => (
                  <div key={i} className={`${element.type} bg-white/80 dark:bg-slate-800/50 p-2 rounded-md border border-slate-100 dark:border-slate-700`}>
                    {element.content}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scene</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Scene {index + 1}? This action cannot be undone.
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

export default SceneCard;
