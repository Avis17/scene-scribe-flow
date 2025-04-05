
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff } from "lucide-react";
import { SceneElement } from "@/contexts/ScriptContext";
import ElementTypeSelector from "./ElementTypeSelector";
import { useSpeechRecognition } from "./SpeechRecognitionContext";

interface ElementEditorProps {
  element: SceneElement;
  index: number;
  onTypeChange: (index: number, type: SceneElement["type"]) => void;
  onContentChange: (index: number, content: string) => void;
  onRemove: (index: number) => void;
}

const ElementEditor: React.FC<ElementEditorProps> = ({
  element,
  index,
  onTypeChange,
  onContentChange,
  onRemove,
}) => {
  const { isRecording, activeElementIndex, startRecording, stopRecording } = useSpeechRecognition();
  
  const isCurrentlyRecording = isRecording && activeElementIndex === index;
  
  const handleRecordingToggle = () => {
    const updateContentCallback = (transcript: string) => {
      const currentContent = element.content;
      onContentChange(index, currentContent + ' ' + transcript);
    };
    
    startRecording(index, updateContentCallback);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <ElementTypeSelector
          value={element.type}
          onChange={(value) => onTypeChange(index, value)}
        />
        <Button 
          variant={isCurrentlyRecording ? "destructive" : "outline"}
          size="sm"
          onClick={handleRecordingToggle}
          className="w-10 p-0 flex justify-center"
          title={isCurrentlyRecording ? "Stop Recording" : "Start Voice Input"}
        >
          {isCurrentlyRecording ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive"
          onClick={() => onRemove(index)}
        >
          Remove
        </Button>
      </div>
      <Textarea
        value={element.content}
        onChange={(e) => onContentChange(index, e.target.value)}
        placeholder={`Enter ${element.type} text${isCurrentlyRecording ? ' (Recording...)' : ''}`}
        className={`${element.type} ${isCurrentlyRecording ? 'border-red-500 border-2' : ''}`}
        rows={3}
      />
    </div>
  );
};

export default ElementEditor;
