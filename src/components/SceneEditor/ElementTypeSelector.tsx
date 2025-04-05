
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SceneElement } from "@/contexts/ScriptContext";

interface ElementTypeSelectorProps {
  value: SceneElement["type"];
  onChange: (value: SceneElement["type"]) => void;
}

const ElementTypeSelector: React.FC<ElementTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <Select
      value={value}
      onValueChange={(value) => onChange(value as SceneElement["type"])}
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
  );
};

export default ElementTypeSelector;
