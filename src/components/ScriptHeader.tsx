
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useScript } from "@/contexts/ScriptContext";
import { useNavigate } from "react-router-dom";
import { Save, FileDown, Lock, Unlock, List } from "lucide-react";
import { exportScriptToPDF } from "@/utils/ScriptsExporter";
import ScriptVersionHistory from "./scripts/ScriptVersionHistory";

const ScriptHeader: React.FC = () => {
  const navigate = useNavigate();
  const { 
    title, 
    setTitle, 
    author, 
    setAuthor, 
    saveScript, 
    scenes, 
    loading, 
    currentScriptId,
    isViewOnly,
    isModified
  } = useScript();

  const [visibility, setVisibility] = useState<"public" | "protected" | "private">("public");

  const handleSave = async () => {
    await saveScript(visibility);
  };

  const handleExport = () => {
    const scriptData = {
      id: currentScriptId || "temp",
      title: title || "Untitled",
      author: author || "Unknown",
      scenes,
    };
    
    exportScriptToPDF(scriptData);
  };

  const handleBackToScripts = () => {
    navigate("/scripts");
  };

  return (
    <div className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto py-4 px-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToScripts}
            className="hidden sm:flex items-center gap-1"
          >
            <List className="h-4 w-4" />
            <span>Scripts</span>
          </Button>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="title" className="sr-only">Title</Label>
            <Input 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Script Title"
              className="text-lg font-bold"
              disabled={isViewOnly}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="author" className="sr-only">Author</Label>
            <Input 
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author Name"
              disabled={isViewOnly}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentScriptId && (
            <ScriptVersionHistory scriptId={currentScriptId} />
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
          >
            <FileDown className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Button
            onClick={() => setVisibility(v => v === "protected" ? "public" : "protected")}
            variant="outline"
            size="sm"
            title={visibility === "protected" ? "Protected Script" : "Public Script"}
            disabled={isViewOnly}
          >
            {visibility === "protected" ? (
              <><Lock className="h-4 w-4 mr-1" /> Protected</>
            ) : (
              <><Unlock className="h-4 w-4 mr-1" /> Public</>
            )}
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={loading || isViewOnly || !isModified}
            size="sm"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScriptHeader;
