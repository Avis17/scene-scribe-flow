
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useScript } from "@/contexts/ScriptContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Save, FileDown, Lock, Unlock, X } from "lucide-react";
import { exportScriptToPDF } from "@/utils/ScriptsExporter";
import ScriptVersionHistory from "./scripts/ScriptVersionHistory";
import { useFirebase } from "@/contexts/FirebaseContext";

// Special admin email that can view all scripts
const ADMIN_EMAIL = "studio.semmaclicks@gmail.com";

const ScriptHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useFirebase();
  
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
    resetScript
  } = useScript();

  const [visibility, setVisibility] = useState<"public" | "protected" | "private">("public");
  const [isFromViewAll, setIsFromViewAll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [localAuthor, setLocalAuthor] = useState(author);

  // Update local state when props change
  useEffect(() => {
    setLocalTitle(title);
    setLocalAuthor(author);
  }, [title, author]);

  // Check if we're coming from the view all scripts page
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const viewAll = searchParams.get('viewAll') === 'true';
    setIsFromViewAll(viewAll);
  }, [location]);

  // Force view-only mode if user is admin and coming from view all page 
  // or if script is already in view-only mode
  const forceViewOnly = (user?.email === ADMIN_EMAIL && isFromViewAll) || isViewOnly;

  // Debounce title and author changes to avoid unnecessary re-renders
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalTitle(newValue);
  }, []);

  const handleAuthorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalAuthor(newValue);
  }, []);

  // Only update context when focus is lost
  const handleTitleBlur = useCallback(() => {
    if (localTitle !== title) {
      setTitle(localTitle);
    }
  }, [localTitle, title, setTitle]);

  const handleAuthorBlur = useCallback(() => {
    if (localAuthor !== author) {
      setAuthor(localAuthor);
    }
  }, [localAuthor, author, setAuthor]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Make sure title and author are saved before calling saveScript
    if (localTitle !== title) {
      setTitle(localTitle);
    }
    if (localAuthor !== author) {
      setAuthor(localAuthor);
    }
    
    await saveScript(visibility);
    setIsSaving(false);
    navigate("/scripts");
  };

  const handleCancel = () => {
    resetScript();
    navigate("/scripts");
  };

  const handleExport = () => {
    const scriptData = {
      id: currentScriptId || "temp",
      title: localTitle || "Untitled",
      author: localAuthor || "Unknown",
      scenes,
    };
    
    exportScriptToPDF(scriptData);
  };

  return (
    <div className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto py-4 px-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="title" className="sr-only">Title</Label>
            <Input 
              id="title"
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              placeholder="Script Title"
              className="text-lg font-bold"
              disabled={forceViewOnly}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="author" className="sr-only">Author</Label>
            <Input 
              id="author"
              value={localAuthor}
              onChange={handleAuthorChange}
              onBlur={handleAuthorBlur}
              placeholder="Author Name"
              disabled={forceViewOnly}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isFromViewAll && (
            <div className="text-xs bg-amber-100 text-amber-800 p-1 px-2 rounded-md flex items-center border border-amber-200">
              Viewing all scripts (Read only)
            </div>
          )}
          
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
          
          {!forceViewOnly && (
            <Button
              onClick={() => setVisibility(v => v === "protected" ? "public" : "protected")}
              variant="outline"
              size="sm"
              title={visibility === "protected" ? "Protected Script" : "Public Script"}
            >
              {visibility === "protected" ? (
                <><Lock className="h-4 w-4 mr-1" /> Protected</>
              ) : (
                <><Unlock className="h-4 w-4 mr-1" /> Public</>
              )}
            </Button>
          )}
          
          {!forceViewOnly && (
            <Button 
              onClick={handleCancel}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          
          {!forceViewOnly && (
            <Button 
              onClick={handleSave}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              {currentScriptId ? "Update" : "Save"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptHeader;
