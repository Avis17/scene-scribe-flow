
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2, Pencil } from "lucide-react";
import { Scene, SceneElement, useScript } from "@/contexts/ScriptContext";
import SceneEditor from "./SceneEditor";

interface SceneCardProps {
  scene: Scene;
  index: number;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, index }) => {
  const { toggleSceneCollapse, deleteScene } = useScript();
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <Card className="mb-4 border-2 border-border hover:border-primary/50 transition-colors animate-fade-in">
      <CardHeader className="p-4 flex flex-row justify-between items-center">
        <div className="flex-1">
          <div className="font-bold text-lg">Scene {index + 1}: {getSceneTitle()}</div>
          {scene.isCollapsed && (
            <div className="text-sm text-muted-foreground mt-1">
              {getScenePreview()}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteScene(scene.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSceneCollapse(scene.id)}
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
  );
};

export default SceneCard;
