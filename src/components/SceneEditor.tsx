
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scene, SceneElement, useScript } from "@/contexts/ScriptContext";
import { PlusCircle, Check } from "lucide-react";

interface SceneEditorProps {
  scene: Scene;
  onClose: () => void;
}

const SceneEditor: React.FC<SceneEditorProps> = ({ scene, onClose }) => {
  const { updateScene } = useScript();
  const [elements, setElements] = useState<SceneElement[]>(scene.elements);

  const handleElementTypeChange = (index: number, type: SceneElement["type"]) => {
    const newElements = [...elements];
    newElements[index] = { ...newElements[index], type };
    setElements(newElements);
  };

  const handleElementContentChange = (index: number, content: string) => {
    const newElements = [...elements];
    newElements[index] = { ...newElements[index], content };
    setElements(newElements);
  };

  const addElement = (type: SceneElement["type"] = "action") => {
    setElements([...elements, { type, content: "" }]);
  };

  const removeElement = (index: number) => {
    const newElements = [...elements];
    newElements.splice(index, 1);
    setElements(newElements);
  };

  const handleSave = () => {
    updateScene(scene.id, elements);
    onClose();
  };

  return (
    <div className="space-y-4">
      {elements.map((element, index) => (
        <div key={index} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Select
              value={element.type}
              onValueChange={(value) => handleElementTypeChange(index, value as SceneElement["type"])}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scene-heading">Scene Heading</SelectItem>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="character">Character</SelectItem>
                <SelectItem value="dialogue">Dialogue</SelectItem>
                <SelectItem value="parenthetical">Parenthetical</SelectItem>
                <SelectItem value="transition">Transition</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive"
              onClick={() => removeElement(index)}
            >
              Remove
            </Button>
          </div>
          <Textarea
            value={element.content}
            onChange={(e) => handleElementContentChange(index, e.target.value)}
            placeholder={`Enter ${element.type} text`}
            className={element.type}
            rows={3}
          />
        </div>
      ))}
      <div className="flex justify-between pt-2">
        <div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => addElement("action")}
            className="mr-2"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Action
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => addElement("character")}
            className="mr-2"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Character
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => addElement("dialogue")}
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Dialogue
          </Button>
        </div>
        <Button onClick={handleSave}>
          <Check className="h-4 w-4 mr-1" /> Done
        </Button>
      </div>
    </div>
  );
};

export default SceneEditor;
