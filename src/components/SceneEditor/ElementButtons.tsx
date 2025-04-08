
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Check, X, Loader } from "lucide-react";
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
          {isAdding === "action" ? (
            <Loader className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4 mr-1" />
          )} Action
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleAddElement("character")}
          disabled={isAdding !== null}
          className="mr-2"
        >
          {isAdding === "character" ? (
            <Loader className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4 mr-1" />
          )} Character
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleAddElement("dialogue")}
          disabled={isAdding !== null}
        >
          {isAdding === "dialogue" ? (
            <Loader className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4 mr-1" />
          )} Dialogue
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
