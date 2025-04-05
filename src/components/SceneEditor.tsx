
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scene, SceneElement, useScript } from "@/contexts/ScriptContext";
import { PlusCircle, Check, Mic, MicOff, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SceneEditorProps {
  scene: Scene;
  onClose: () => void;
}

const SceneEditor: React.FC<SceneEditorProps> = ({ scene, onClose }) => {
  const { updateScene } = useScript();
  const [elements, setElements] = useState<SceneElement[]>(scene.elements);
  const [isRecording, setIsRecording] = useState(false);
  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(null);
  const [recognitionLanguage, setRecognitionLanguage] = useState<string>("en-US");
  const { toast } = useToast();
  
  let recognition: SpeechRecognition | null = null;
  
  // Initialize speech recognition if supported
  const initializeSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Browser supports speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = recognitionLanguage;
      
      return true;
    }
    return false;
  };

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
    stopRecording();
    updateScene(scene.id, elements);
    onClose();
  };
  
  const toggleRecording = (index: number) => {
    if (isRecording && activeElementIndex === index) {
      stopRecording();
      return;
    }
    
    if (!initializeSpeechRecognition()) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRecording(true);
    setActiveElementIndex(index);
    
    if (recognition) {
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
          
        // Update the current element with the transcript
        const newElements = [...elements];
        const currentContent = newElements[index].content;
        newElements[index] = { 
          ...newElements[index], 
          content: currentContent + ' ' + transcript 
        };
        setElements(newElements);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
          title: "Error",
          description: `Speech recognition error: ${event.error}`,
          variant: "destructive",
        });
        stopRecording();
      };
      
      recognition.onend = () => {
        if (isRecording) {
          // If we're still supposed to be recording, restart
          recognition?.start();
        }
      };
      
      try {
        recognition.start();
        toast({
          title: "Recording Started",
          description: "Speak now. Your speech will be converted to text.",
        });
      } catch (error) {
        console.error('Speech recognition start error', error);
        setIsRecording(false);
        setActiveElementIndex(null);
      }
    }
  };
  
  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
    setActiveElementIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select
          value={recognitionLanguage}
          onValueChange={(value) => setRecognitionLanguage(value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">English</SelectItem>
            <SelectItem value="ta-IN">Tamil</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
              variant={isRecording && activeElementIndex === index ? "destructive" : "outline"}
              size="sm"
              onClick={() => toggleRecording(index)}
              className="w-10 p-0 flex justify-center"
              title={isRecording && activeElementIndex === index ? "Stop Recording" : "Start Voice Input"}
            >
              {isRecording && activeElementIndex === index ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
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
            placeholder={`Enter ${element.type} text${isRecording && activeElementIndex === index ? ' (Recording...)' : ''}`}
            className={`${element.type} ${isRecording && activeElementIndex === index ? 'border-red-500 border-2' : ''}`}
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
