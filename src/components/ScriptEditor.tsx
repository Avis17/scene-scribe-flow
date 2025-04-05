
import React from "react";
import { useScript } from "@/contexts/ScriptContext";
import ScriptHeader from "./ScriptHeader";
import SceneCard from "./SceneCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

const ScriptEditor: React.FC = () => {
  const { scenes, reorderScenes, addScene, isViewOnly } = useScript();

  const onDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    reorderScenes(result.source.index, result.destination.index);
  };

  return (
    <div className="min-h-screen bg-background">
      <ScriptHeader />
      
      <div className="container mx-auto p-4">
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
            onClick={addScene} 
            disabled={isViewOnly}
            className="flex items-center gap-2"
            size="lg"
            variant="outline"
          >
            <Plus className="h-5 w-5" /> Add Scene
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
