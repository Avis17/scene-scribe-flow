
import React from "react";
import { useScript } from "@/contexts/ScriptContext";
import { Input } from "@/components/ui/input";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { Save, FileDown, Plus } from "lucide-react";

const ScriptHeader: React.FC = () => {
  const { title, setTitle, author, setAuthor, addScene } = useScript();

  return (
    <div className="p-4 border-b sticky top-0 bg-background z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold border-none shadow-none hover:bg-muted focus:bg-muted px-2 rounded"
            placeholder="Screenplay Title"
          />
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="text-sm text-muted-foreground border-none shadow-none hover:bg-muted focus:bg-muted px-2 rounded"
            placeholder="Author Name"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <ThemeToggle />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Button onClick={addScene} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Scene
        </Button>
      </div>
    </div>
  );
};

export default ScriptHeader;
