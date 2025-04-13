
import { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from "react";
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
  isModified: boolean;
  loadError: string | null;
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
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const { user } = useFirebase();
  const scriptService = useScriptService();
  const { toast } = useToast();
  const loadingRef = useRef<boolean>(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);
  const currentScenesRef = useRef<Scene[]>(scenes);

  // Update the ref when scenes change
  useEffect(() => {
    currentScenesRef.current = scenes;
  }, [scenes]);

  const handleSetTitle = (newTitle: string) => {
    if (newTitle !== title) {
      setIsModified(true);
      setTitle(newTitle);
    }
  };

  const handleSetAuthor = (newAuthor: string) => {
    if (newAuthor !== author) {
      setIsModified(true);
      setAuthor(newAuthor);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (user && user.displayName && author === "") {
      setAuthor(user.displayName);
    }
  }, [user, author]);

  const resetScript = useCallback(() => {
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
    setIsModified(false);
    setLoadError(null);
  }, [user]);

  useEffect(() => {
    const loadScript = async () => {
      if (currentScriptId && !loadingRef.current && !isModified) {
        try {
          loadingRef.current = true;
          setLoading(true);
          setIsEditing(true);
          setLoadError(null);
          
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
          
          const scriptData = await scriptService.getScriptById(currentScriptId);
          
          if (!mountedRef.current) {
            return;
          }
          
          if (!scriptData) {
            setLoadError(`Script with ID ${currentScriptId} not found.`);
            toast({
              title: "Error",
              description: "Script not found. It may have been deleted.",
              variant: "destructive",
            });
            resetScript();
            return;
          }
          
          setTitle(scriptData.title || "Untitled Screenplay");
          setAuthor(scriptData.author || "");
          
          if (Array.isArray(scriptData.scenes) && scriptData.scenes.length > 0) {
            const loadedScenes = JSON.parse(JSON.stringify(scriptData.scenes));
            
            const processedScenes = loadedScenes.map((scene: any) => ({
              ...scene,
              isCollapsed: scene.isCollapsed !== undefined ? scene.isCollapsed : false,
              id: scene.id || `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              elements: Array.isArray(scene.elements) && scene.elements.length > 0 ? scene.elements : [
                {
                  type: "scene-heading" as const,
                  content: "INT. LOCATION - DAY",
                },
                {
                  type: "action" as const,
                  content: "",
                },
              ]
            }));
            
            setScenes(processedScenes);
          } else {
            setScenes([{
              id: "scene-1",
              isCollapsed: false,
              elements: [
                {
                  type: "scene-heading" as const,
                  content: "INT. LIVING ROOM - DAY",
                },
                {
                  type: "action" as const,
                  content: "The room is empty. Sunlight streams through large windows.",
                },
              ],
            }]);
          }
          
          const isSharedWithMe = user?.uid && scriptData.userId && user.uid !== scriptData.userId;
          let isViewOnlyAccess = false;
          
          if (isSharedWithMe && user?.email && scriptData.sharedWith?.[user.email]) {
            isViewOnlyAccess = scriptData.sharedWith[user.email].accessLevel === "view";
          }
          
          setIsViewOnly(isViewOnlyAccess);
          
          if (isViewOnlyAccess) {
            toast({
              title: "View Only Access",
              description: "You have view-only access to this script and cannot make changes.",
            });
          }
          
          setIsModified(false);
          setIsInitialized(true);
        } catch (error) {
          if (!mountedRef.current) {
            return;
          }
          
          const errorMessage = error instanceof Error ? error.message : "Failed to load script";
          setLoadError(errorMessage);
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          resetScript();
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
          
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
          
          setTimeout(() => {
            loadingRef.current = false;
          }, 300);
        }
      } else {
        if (mountedRef.current && !currentScriptId) {
          setIsEditing(false);
          setIsViewOnly(false);
        }
      }
    };
    
    loadScript();
  }, [currentScriptId, user, toast, scriptService, resetScript, isModified]);

  const addScene = () => {
    setIsModified(true);
    const newId = `scene-${Date.now()}`;
    setScenes(prevScenes => {
      const newScenes = [
        ...prevScenes,
        {
          id: newId,
          isCollapsed: false,
          elements: [
            {
              type: "scene-heading" as const,
              content: "INT. LOCATION - TIME",
            },
            {
              type: "action" as const,
              content: "",
            },
          ],
        },
      ];
      return newScenes;
    });
  };

  const updateScene = (id: string, elements: SceneElement[]) => {
    setIsModified(true);
    setScenes(prevScenes => {
      const newScenes = prevScenes.map(scene => 
        scene.id === id ? { ...scene, elements } : scene
      );
      return newScenes;
    });
  };

  const deleteScene = (id: string) => {
    setIsModified(true);
    setScenes(prevScenes => prevScenes.filter((scene) => scene.id !== id));
  };

  const reorderScenes = (sourceIndex: number, destinationIndex: number) => {
    setIsModified(true);
    setScenes(prevScenes => {
      const result = Array.from(prevScenes);
      const [removed] = result.splice(sourceIndex, 1);
      result.splice(destinationIndex, 0, removed);
      return result;
    });
  };

  const toggleSceneCollapse = (id: string) => {
    setScenes(prevScenes =>
      prevScenes.map((scene) =>
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
        await scriptService.updateScript(currentScriptId, title, author, currentScenesRef.current, visibility, user.email);
        toast({
          title: "Success",
          description: "Script updated successfully",
        });
        setIsModified(false);
        return currentScriptId;
      } else {
        const newScriptId = await scriptService.saveScript(title, author, currentScenesRef.current, visibility);
        setCurrentScriptId(newScriptId);
        toast({
          title: "Success",
          description: "Script saved successfully",
        });
        setIsModified(false);
        return newScriptId;
      }
    } catch (error) {
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
        setTitle: handleSetTitle,
        author,
        setAuthor: handleSetAuthor,
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
        isModified,
        loadError
      }}
    >
      {children}
    </ScriptContext.Provider>
  );
};
