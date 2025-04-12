
import React, { useState, useEffect } from "react";
import { Scene, SceneElement, useScript } from "@/contexts/ScriptContext";
import { SpeechRecognitionProvider } from "./SpeechRecognitionContext";
import ElementEditor from "./ElementEditor";
import ElementButtons from "./ElementButtons";
import LanguageSelector from "./LanguageSelector";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SceneEditorProps {
  scene: Scene;
  onClose: () => void;
}

const SceneEditor: React.FC<SceneEditorProps> = ({ scene, onClose }) => {
  const { updateScene } = useScript();
  const [elements, setElements] = useState<SceneElement[]>(scene.elements);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setElements(scene.elements);
  }, [scene]);
  
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log("Saving scene:", scene.id);
      console.log("With elements:", elements);
      
      // Create a deep copy to avoid reference issues
      const elementsCopy = JSON.parse(JSON.stringify(elements));
      
      // Make sure we have at least one element
      if (elementsCopy.length === 0) {
        elementsCopy.push({
          type: "scene-heading",
          content: "INT. LOCATION - TIME"
        });
      }
      
      // Update the scene in the context
      updateScene(scene.id, elementsCopy);
      
      toast({
        title: "Scene saved",
        description: "Your changes have been saved successfully",
      });
      
      // Short delay before closing to show the success state
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 800);
    } catch (error) {
      console.error("Error saving scene:", error);
      toast({
        title: "Save failed",
        description: "There was a problem saving your changes",
        variant: "destructive"
      });
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (isSaving) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-fade-in">
        <Loader className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-lg font-medium">Saving scene changes...</p>
      </div>
    );
  }

  return (
    <SpeechRecognitionProvider>
      <div className="space-y-4 animate-fade-in">
        <LanguageSelector />
        
        {elements.map((element, index) => (
          <ElementEditor
            key={index}
            element={element}
            index={index}
            onTypeChange={handleElementTypeChange}
            onContentChange={handleElementContentChange}
            onRemove={removeElement}
          />
        ))}
        
        <ElementButtons 
          onAddElement={addElement} 
          onSave={handleSave} 
          onCancel={handleCancel}
        />
      </div>
    </SpeechRecognitionProvider>
  );
};

export default SceneEditor;
