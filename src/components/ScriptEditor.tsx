
import React, { useState, useEffect } from "react";
import { useScript } from "@/contexts/ScriptContext";
import ScriptHeader from "./ScriptHeader";
import SceneCard from "./SceneCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "./ui/button";
import { Plus, Loader } from "lucide-react";
import { Progress } from "./ui/progress";

const ScriptEditor: React.FC = () => {
  const { scenes, reorderScenes, addScene, isViewOnly, loading } = useScript();
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 90) {
            clearInterval(interval);
            return 90;
          }
          return newProgress;
        });
      }, 100);
      
      return () => {
        clearInterval(interval);
        setProgress(0);
      };
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 500);
      
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [loading]);

  const onDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    reorderScenes(result.source.index, result.destination.index);
  };
  
  const handleAddScene = () => {
    setIsAddingScene(true);
    addScene();
    setTimeout(() => {
      setIsAddingScene(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <ScriptHeader />
      
      {loading && progress > 0 && (
        <Progress 
          value={progress} 
          className="h-1 w-full bg-blue-100 dark:bg-blue-900/30" 
        />
      )}
      
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
        
        {/* Add Scene Button */}
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleAddScene} 
            disabled={isViewOnly || isAddingScene}
            className="flex items-center gap-2"
            size="lg"
            variant="outline"
          >
            {isAddingScene ? (
              <>
                <Loader className="h-5 w-5 animate-spin" /> Adding Scene...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" /> Add Scene
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
