
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Check, X } from "lucide-react";
import { SceneElement } from "@/contexts/ScriptContext";

interface ElementButtonsProps {
  onAddElement: (type: SceneElement["type"]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ElementButtons: React.FC<ElementButtonsProps> = ({ onAddElement, onSave, onCancel }) => {
  const [isAdding, setIsAdding] = useState<string | null>(null);
  
  const handleAddElement = (type: SceneElement["type"]) => {
    setIsAdding(type);
    onAddElement(type);
    setTimeout(() => {
      setIsAdding(null);
    }, 500);
  };
  
  return (
    <div className="flex justify-between pt-2">
      <div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleAddElement("action")}
          disabled={isAdding !== null}
          className="mr-2"
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Action
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleAddElement("character")}
          disabled={isAdding !== null}
          className="mr-2"
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Character
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleAddElement("dialogue")}
          disabled={isAdding !== null}
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Dialogue
        </Button>
      </div>
      <div className="space-x-2">
        <Button variant="ghost" onClick={onCancel} type="button">
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button onClick={onSave} type="button">
          <Check className="h-4 w-4 mr-1" /> Update
        </Button>
      </div>
    </div>
  );
};

export default ElementButtons;
