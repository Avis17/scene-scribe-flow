
import React from "react";
import { useScript } from "@/contexts/ScriptContext";
import ScriptHeader from "./ScriptHeader";
import SceneCard from "./SceneCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ScriptEditor: React.FC = () => {
  const { scenes, reorderScenes } = useScript();

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
      </div>
    </div>
  );
};

export default ScriptEditor;
