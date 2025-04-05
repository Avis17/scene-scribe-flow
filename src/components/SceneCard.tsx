
import React, { useState } from "react";
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

interface SceneCardProps {
  scene: Scene;
  index: number;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, index }) => {
  const { toggleSceneCollapse, deleteScene } = useScript();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getSceneTitle = () => {
    const heading = scene.elements.find(
      (element) => element.type === "scene-heading"
    );
    return heading ? heading.content : "Untitled Scene";
  };

  const getScenePreview = () => {
    const action = scene.elements.find((element) => element.type === "action");
    return action ? action.content.substring(0, 100) + (action.content.length > 100 ? "..." : "") : "";
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const confirmDelete = () => {
    setShowDeleteDialog(true);
  };
  
  const handleDelete = () => {
    deleteScene(scene.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="mb-4 border-2 border-border hover:border-primary/50 transition-colors animate-fade-in">
        <CardHeader className="p-4 flex flex-row justify-between items-center flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg truncate">{`Scene ${index + 1}: ${getSceneTitle()}`}</div>
            {scene.isCollapsed && (
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {getScenePreview()}
              </div>
            )}
          </div>
          <div className="flex items-center flex-wrap gap-2">
            {isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                type="button"
              >
                <X className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Cancel</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                type="button"
              >
                <Pencil className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Edit</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={confirmDelete}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Delete</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSceneCollapse(scene.id)}
              type="button"
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
          <CardContent className="p-4 pt-0">
            {isEditing ? (
              <SceneEditor scene={scene} onClose={() => setIsEditing(false)} />
            ) : (
              <div className="space-y-2 prose max-w-none">
                {scene.elements.map((element, i) => (
                  <div key={i} className={element.type}>
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
