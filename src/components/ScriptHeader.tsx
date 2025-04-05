
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useScript } from "@/contexts/ScriptContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { ScriptVisibility } from "@/services/ScriptService";

const ScriptHeader: React.FC = () => {
  const { title, setTitle, author, setAuthor, saveScript, currentScriptId, loading, resetScript } = useScript();
  const [visibility, setVisibility] = useState<ScriptVisibility>("public");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!visibility) {
      toast({
        title: "Selection Required",
        description: "Please select script visibility before saving",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const scriptId = await saveScript(visibility);
      if (scriptId && !currentScriptId) {
        navigate("/"); // Stay on the page after first save
      }
      
      if (scriptId) {
        toast({
          title: "Success",
          description: "Script saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving script:", error);
      toast({
        title: "Error",
        description: "Failed to save script",
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    if (currentScriptId) {
      navigate("/scripts");
    } else {
      resetScript();
      navigate("/scripts");
    }
  };
  
  useEffect(() => {
    document.title = `Scriptly - ${title || "Untitled Screenplay"}`;
  }, [title]);
  
  return (
    <>
      <AppHeader />
      <div className="flex flex-col gap-4 p-6 border-b">
        <div className="flex items-center gap-4 w-full">
          <Button variant="outline" size="icon" onClick={handleGoBack} type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Screenplay Title"
            className="text-lg font-bold focus-visible:ring-1 w-full max-w-md"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author Name"
            className="focus-visible:ring-1 w-full max-w-md"
          />
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Select
              value={visibility}
              onValueChange={(value: ScriptVisibility) => setVisibility(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="protected">Protected (Admin Only)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto" type="button">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScriptHeader;
