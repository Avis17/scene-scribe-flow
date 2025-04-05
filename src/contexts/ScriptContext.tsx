
import { createContext, useState, useContext, ReactNode } from "react";

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

  const addScene = () => {
    const newId = `scene-${scenes.length + 1}`;
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
      }}
    >
      {children}
    </ScriptContext.Provider>
  );
};
