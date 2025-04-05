
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Check, X } from "lucide-react";
import { SceneElement } from "@/contexts/ScriptContext";

interface ElementButtonsProps {
  onAddElement: (type: SceneElement["type"]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ElementButtons: React.FC<ElementButtonsProps> = ({ onAddElement, onSave, onCancel }) => {
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
      <div className="space-x-2">
        <Button variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button onClick={onSave}>
          <Check className="h-4 w-4 mr-1" /> Done
        </Button>
      </div>
    </div>
  );
};

export default ElementButtons;
