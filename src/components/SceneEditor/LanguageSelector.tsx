
import React from "react";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpeechRecognition } from "./SpeechRecognitionContext";

const LanguageSelector: React.FC = () => {
  const { recognitionLanguage, setRecognitionLanguage } = useSpeechRecognition();
  
  return (
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
  );
};

export default LanguageSelector;
