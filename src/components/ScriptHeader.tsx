
import React from "react";
import { useScript } from "@/contexts/ScriptContext";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { Save, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; 
import AppHeader from "./AppHeader";
import { useFirebase } from "@/contexts/FirebaseContext";

const ScriptHeader: React.FC = () => {
  const { title, setTitle, author, setAuthor, addScene, saveScript, loading, scenes } = useScript();
  const { user } = useFirebase();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    try {
      const scriptId = await saveScript();
      if (scriptId) {
        toast({
          title: "Success",
          description: "Script saved successfully",
        });
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save script",
        variant: "destructive",
      });
    }
  };
  
  const handleAddScene = () => {
    addScene();
    // Optionally scroll to the new scene
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
      });
    }, 100);
  };
  
  const handleExport = () => {
    try {
      exportScriptToPDF();
      toast({
        title: "Success",
        description: "Script exported successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export script",
        variant: "destructive",
      });
    }
  };
  
  const exportScriptToPDF = () => {
    let content = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Courier, monospace; margin: 60px; line-height: 1.6; }
            h1 { text-align: center; margin-bottom: 4px; }
            .author { text-align: center; margin-bottom: 50px; }
            .scene-heading { font-weight: bold; text-transform: uppercase; margin-top: 20px; }
            .action { margin: 10px 0; }
            .character { margin-left: 20%; margin-bottom: 0; margin-top: 20px; font-weight: bold; }
            .dialogue { margin-left: 10%; margin-right: 20%; margin-bottom: 20px; }
            .parenthetical { margin-left: 15%; margin-bottom: 0; font-style: italic; }
            .transition { margin-left: 60%; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="author">by ${author}</p>
    `;
    
    scenes.forEach((scene, sceneIndex) => {
      scene.elements.forEach((element) => {
        content += `<div class="${element.type}">${element.content}</div>`;
      });
    });
    
    content += `
        </body>
      </html>
    `;
    
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'absolute';
    printIframe.style.top = '-9999px';
    document.body.appendChild(printIframe);
    
    const contentWindow = printIframe.contentWindow;
    if (contentWindow) {
      contentWindow.document.open();
      contentWindow.document.write(content);
      contentWindow.document.close();
      
      setTimeout(() => {
        contentWindow.focus();
        contentWindow.print();
        document.body.removeChild(printIframe);
      }, 250);
    }
  };

  return (
    <>
      <AppHeader />
      <div className="p-4 border-b bg-background z-5">
        <div className="flex flex-col space-y-2 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button onClick={handleAddScene} variant="outline" type="button">
              Add Scene
            </Button>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSave} 
                disabled={loading}
                type="button"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                type="button"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold text-center border-none shadow-none hover:bg-muted focus:bg-muted px-2 rounded"
            placeholder="Screenplay Title"
          />
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="text-sm text-muted-foreground text-center border-none shadow-none hover:bg-muted focus:bg-muted px-2 rounded"
            placeholder="Author Name"
          />
        </div>
      </div>
    </>
  );
};

export default ScriptHeader;
