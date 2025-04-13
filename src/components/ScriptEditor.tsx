
import React, { useState, useCallback } from "react";
import { useScript } from "@/contexts/ScriptContext";
import ScriptHeader from "./ScriptHeader";
import SceneCard from "./SceneCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "./ui/button";
import { Plus, FileText, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScriptEditorProps {
  mode?: "create" | "edit";
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ mode = "create" }) => {
  const { scenes, reorderScenes, addScene, isViewOnly, currentScriptId } = useScript();
  const { toast } = useToast();

  const onDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    reorderScenes(result.source.index, result.destination.index);
  };
  
  const handleAddScene = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (isViewOnly) {
      toast({
        title: "View Only Mode",
        description: "You cannot add scenes in view-only mode",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Adding new scene...");
    try {
      // Add scene directly without reload
      addScene();
      toast({
        title: "Scene added",
        description: "New scene has been added to your script"
      });
    } catch (error) {
      console.error("Error adding scene:", error);
      toast({
        title: "Error",
        description: "Failed to add new scene",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Page mode indicator */}
      <div className="bg-slate-100 dark:bg-slate-800 border-b">
        <div className="container mx-auto py-2 px-4">
          <div className="flex items-center text-sm text-muted-foreground">
            {mode === "create" ? (
              <>
                <FileText className="h-4 w-4 mr-2 text-primary" />
                <span>Creating new screenplay</span>
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2 text-blue-500" />
                <span>Editing existing screenplay</span>
                {currentScriptId && <span className="ml-2 text-xs opacity-50">ID: {currentScriptId}</span>}
              </>
            )}
          </div>
        </div>
      </div>
      
      <ScriptHeader />
      
      <div className="container mx-auto p-4 animate-fade-in">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="scenes">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {scenes.map((scene, index) => (
                  <Draggable key={scene.id} draggableId={scene.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <SceneCard scene={scene} index={index} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        {/* Add Scene Button - fixed position */}
        <div className="mt-8 mb-20 flex justify-center">
          <Button 
            onClick={handleAddScene}
            disabled={isViewOnly}
            className="flex items-center gap-2 relative z-10"
            size="lg"
            variant="outline"
            type="button"
          >
            <Plus className="h-5 w-5" /> Add Scene
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
