import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { useFirebase } from "./FirebaseContext";
import { useScriptService, ScriptVisibility } from "@/services/ScriptService";
import { useToast } from "@/hooks/use-toast";

export interface SceneElement {
  type: 'scene-heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';
  content: string;
}

export interface Scene {
  id: string;
  elements: SceneElement[];
  isCollapsed: boolean;
}

interface ScriptContextType {
  title: string;
  setTitle: (title: string) => void;
  author: string;
  setAuthor: (author: string) => void;
  scenes: Scene[];
  addScene: () => void;
  updateScene: (id: string, elements: SceneElement[]) => void;
  deleteScene: (id: string) => void;
  reorderScenes: (sourceIndex: number, destinationIndex: number) => void;
  toggleSceneCollapse: (id: string) => void;
  saveScript: (visibility?: ScriptVisibility) => Promise<string | undefined>;
  currentScriptId: string | null;
  setCurrentScriptId: (id: string | null) => void;
  loading: boolean;
  resetScript: () => void;
  isEditing: boolean;
  isViewOnly: boolean;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const useScript = () => {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error("useScript must be used within a ScriptProvider");
  }
  return context;
};

export const ScriptProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState<string>("Untitled Screenplay");
  const [author, setAuthor] = useState<string>("");
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: "scene-1",
      isCollapsed: false,
      elements: [
        {
          type: "scene-heading",
          content: "INT. LIVING ROOM - DAY",
        },
        {
          type: "action",
          content: "The room is empty. Sunlight streams through large windows.",
        },
      ],
    },
  ]);
  const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isViewOnly, setIsViewOnly] = useState<boolean>(false);
  
  const { user } = useFirebase();
  const scriptService = useScriptService();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.displayName && author === "") {
      setAuthor(user.displayName);
    }
  }, [user, author]);

  const resetScript = useCallback(() => {
    console.log("Resetting script to default state");
    setTitle("Untitled Screenplay");
    setAuthor(user?.displayName || "");
    setScenes([
      {
        id: "scene-1",
        isCollapsed: false,
        elements: [
          {
            type: "scene-heading",
            content: "INT. LIVING ROOM - DAY",
          },
          {
            type: "action",
            content: "The room is empty. Sunlight streams through large windows.",
          },
        ],
      },
    ]);
    setCurrentScriptId(null);
    setIsViewOnly(false);
    setIsEditing(false);
  }, [user]);

  useEffect(() => {
    const loadScript = async () => {
      if (currentScriptId && user) {
        try {
          setLoading(true);
          setIsEditing(true);
          const scriptData = await scriptService.getScriptById(currentScriptId);
          
          if (scriptData) {
            setTitle(scriptData.title || "Untitled Screenplay");
            setAuthor(scriptData.author || "");
            setScenes(scriptData.scenes || []);
            
            const isSharedWithMe = user?.uid && scriptData.userId && user.uid !== scriptData.userId;
            let isViewOnlyAccess = false;
            
            if (isSharedWithMe && user?.email && scriptData.sharedWith?.[user.email]) {
              isViewOnlyAccess = scriptData.sharedWith[user.email].accessLevel === "view";
            }
            
            setIsViewOnly(isViewOnlyAccess);
            console.log("Loaded script:", scriptData, "View only:", isViewOnlyAccess);
            
            if (isViewOnlyAccess) {
              toast({
                title: "View Only Access",
                description: "You have view-only access to this script and cannot make changes.",
              });
            }
          }
        } catch (error) {
          console.error("Error loading script:", error);
          toast({
            title: "Error",
            description: "Failed to load script",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setIsEditing(false);
        setIsViewOnly(false);
      }
    };
    
    loadScript();
  }, [currentScriptId, user]);

  const addScene = () => {
    const newId = `scene-${Date.now()}`;
    setScenes([
      ...scenes,
      {
        id: newId,
        isCollapsed: false,
        elements: [
          {
            type: "scene-heading",
            content: "INT. LOCATION - TIME",
          },
          {
            type: "action",
            content: "",
          },
        ],
      },
    ]);
  };

  const updateScene = (id: string, elements: SceneElement[]) => {
    setScenes(scenes.map((scene) => 
      scene.id === id ? { ...scene, elements } : scene
    ));
  };

  const deleteScene = (id: string) => {
    setScenes(scenes.filter((scene) => scene.id !== id));
  };

  const reorderScenes = (sourceIndex: number, destinationIndex: number) => {
    const result = Array.from(scenes);
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(destinationIndex, 0, removed);
    setScenes(result);
  };

  const toggleSceneCollapse = (id: string) => {
    setScenes(
      scenes.map((scene) =>
        scene.id === id ? { ...scene, isCollapsed: !scene.isCollapsed } : scene
      )
    );
  };

  const saveScript = async (visibility: ScriptVisibility = "public"): Promise<string | undefined> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your script",
        variant: "destructive",
      });
      return;
    }
    
    if (isViewOnly) {
      toast({
        title: "Permission Denied",
        description: "You have view-only access to this script and cannot save changes.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      if (currentScriptId) {
        await scriptService.updateScript(currentScriptId, title, author, scenes, visibility);
        toast({
          title: "Success",
          description: "Script updated successfully",
        });
        return currentScriptId;
      } else {
        const newScriptId = await scriptService.saveScript(title, author, scenes, visibility);
        setCurrentScriptId(newScriptId);
        toast({
          title: "Success",
          description: "Script saved successfully",
        });
        return newScriptId;
      }
    } catch (error) {
      console.error("Error saving script:", error);
      toast({
        title: "Error",
        description: "Failed to save script",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScriptContext.Provider
      value={{
        title,
        setTitle,
        author,
        setAuthor,
        scenes,
        addScene,
        updateScene,
        deleteScene,
        reorderScenes,
        toggleSceneCollapse,
        saveScript,
        currentScriptId,
        setCurrentScriptId,
        loading,
        resetScript,
        isEditing,
        isViewOnly,
      }}
    >
      {children}
    </ScriptContext.Provider>
  );
};
