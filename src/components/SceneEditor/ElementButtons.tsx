
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Check } from "lucide-react";
import { SceneElement } from "@/contexts/ScriptContext";

interface ElementButtonsProps {
  onAddElement: (type: SceneElement["type"]) => void;
  onSave: () => void;
}

const ElementButtons: React.FC<ElementButtonsProps> = ({ onAddElement, onSave }) => {
  return (
    <div className="flex justify-between pt-2">
      <div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAddElement("action")}
          className="mr-2"
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Action
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAddElement("character")}
          className="mr-2"
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Character
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAddElement("dialogue")}
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Dialogue
        </Button>
      </div>
      <Button onClick={onSave}>
        <Check className="h-4 w-4 mr-1" /> Done
      </Button>
    </div>
  );
};

export default ElementButtons;
