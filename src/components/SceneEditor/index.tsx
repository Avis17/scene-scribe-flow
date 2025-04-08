
import React, { useState } from "react";
import { Scene, SceneElement, useScript } from "@/contexts/ScriptContext";
import { SpeechRecognitionProvider } from "./SpeechRecognitionContext";
import ElementEditor from "./ElementEditor";
import ElementButtons from "./ElementButtons";
import LanguageSelector from "./LanguageSelector";
import { Loader } from "lucide-react";

interface SceneEditorProps {
  scene: Scene;
  onClose: () => void;
}

const SceneEditor: React.FC<SceneEditorProps> = ({ scene, onClose }) => {
  const { updateScene } = useScript();
  const [elements, setElements] = useState<SceneElement[]>(scene.elements);
  const [isSaving, setIsSaving] = useState(false);
  
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
    setIsSaving(true);
    updateScene(scene.id, elements);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
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
