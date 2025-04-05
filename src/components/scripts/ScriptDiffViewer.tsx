
import React from "react";
import { ScriptVersion } from "@/services/ScriptService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  PlusCircle, 
  MinusCircle, 
  AlertCircle,
  MoveRight,
  ArrowRightLeft,
  CornerDownRight
} from "lucide-react";

interface ScriptDiffViewerProps {
  oldVersion: ScriptVersion;
  newVersion: ScriptVersion;
}

const ScriptDiffViewer: React.FC<ScriptDiffViewerProps> = ({ oldVersion, newVersion }) => {
  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Helper function to get display name from email
  const getDisplayName = (emailOrName: string | null) => {
    if (!emailOrName) return "Unknown";
    if (emailOrName.includes('@')) {
      return emailOrName.split('@')[0];
    }
    return emailOrName;
  };

  // Compare title changes
  const titleChanged = oldVersion.title !== newVersion.title;
  
  // Compare author changes
  const authorChanged = oldVersion.author !== newVersion.author;
  
  // Compare scenes (added, removed, modified)
  const oldSceneIds = new Set(oldVersion.scenes.map(scene => scene.id));
  const newSceneIds = new Set(newVersion.scenes.map(scene => scene.id));
  
  const addedScenes = newVersion.scenes.filter(scene => !oldSceneIds.has(scene.id));
  const removedScenes = oldVersion.scenes.filter(scene => !newSceneIds.has(scene.id));
  
  // Find modified scenes (same id but different content)
  const modifiedScenes = newVersion.scenes.filter(newScene => {
    if (!oldSceneIds.has(newScene.id)) return false;
    
    const oldScene = oldVersion.scenes.find(scene => scene.id === newScene.id);
    if (!oldScene) return false;
    
    // Compare elements
    if (oldScene.elements.length !== newScene.elements.length) return true;
    
    // Check if any element content has changed
    for (let i = 0; i < oldScene.elements.length; i++) {
      if (
        oldScene.elements[i].type !== newScene.elements[i].type ||
        oldScene.elements[i].content !== newScene.elements[i].content
      ) {
        return true;
      }
    }
    
    return false;
  });
  
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-md p-3 flex flex-col md:flex-row gap-4 justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">From:</p>
          <div className="text-sm">
            <p><strong>Date:</strong> {formatDate(oldVersion.timestamp)}</p>
            <p><strong>Editor:</strong> {getDisplayName(oldVersion.editor)}</p>
          </div>
        </div>
        
        <ArrowRightLeft className="hidden md:block h-6 w-6 text-muted-foreground" />
        
        <div className="space-y-1">
          <p className="text-sm font-medium">To:</p>
          <div className="text-sm">
            <p><strong>Date:</strong> {formatDate(newVersion.timestamp)}</p>
            <p><strong>Editor:</strong> {getDisplayName(newVersion.editor)}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Document Changes</h3>
        
        {/* Title changes */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Title:</p>
          {titleChanged ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MinusCircle className="h-4 w-4 text-red-500" />
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded border-l-2 border-red-500 flex-1">
                  {oldVersion.title}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-green-500" />
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded border-l-2 border-green-500 flex-1">
                  {newVersion.title}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm">{newVersion.title} <span className="text-muted-foreground">(unchanged)</span></p>
          )}
        </div>
        
        {/* Author changes */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Author:</p>
          {authorChanged ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MinusCircle className="h-4 w-4 text-red-500" />
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded border-l-2 border-red-500 flex-1">
                  {oldVersion.author}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-green-500" />
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded border-l-2 border-green-500 flex-1">
                  {newVersion.author}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm">{newVersion.author} <span className="text-muted-foreground">(unchanged)</span></p>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* Scene Changes */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Scene Changes</h3>
        
        {/* Summary of changes */}
        <div className="bg-muted/30 p-3 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
              <PlusCircle className="h-4 w-4 text-green-500" /> Added Scenes
            </p>
            <p className="text-2xl font-bold">{addedScenes.length}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
              <MinusCircle className="h-4 w-4 text-red-500" /> Removed Scenes
            </p>
            <p className="text-2xl font-bold">{removedScenes.length}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-amber-500" /> Modified Scenes
            </p>
            <p className="text-2xl font-bold">{modifiedScenes.length}</p>
          </div>
        </div>
        
        {/* Added scenes */}
        {addedScenes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-md font-semibold flex items-center gap-1">
              <PlusCircle className="h-4 w-4 text-green-500" />
              Added Scenes
            </h4>
            
            {addedScenes.map((scene, index) => (
              <div key={scene.id} className="border-l-2 border-green-500 pl-3 space-y-2">
                <p className="text-sm font-medium">Scene #{index + 1}</p>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-md">
                  {scene.elements.map((element, eIndex) => (
                    <div key={eIndex} className="mb-2">
                      <p className="text-xs text-muted-foreground">{element.type}</p>
                      <p className="text-sm">{element.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Removed scenes */}
        {removedScenes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-md font-semibold flex items-center gap-1">
              <MinusCircle className="h-4 w-4 text-red-500" />
              Removed Scenes
            </h4>
            
            {removedScenes.map((scene, index) => (
              <div key={scene.id} className="border-l-2 border-red-500 pl-3 space-y-2">
                <p className="text-sm font-medium">Scene #{index + 1}</p>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
                  {scene.elements.map((element, eIndex) => (
                    <div key={eIndex} className="mb-2">
                      <p className="text-xs text-muted-foreground">{element.type}</p>
                      <p className="text-sm">{element.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Modified scenes */}
        {modifiedScenes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-md font-semibold flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Modified Scenes
            </h4>
            
            {modifiedScenes.map((newScene) => {
              const oldScene = oldVersion.scenes.find(scene => scene.id === newScene.id);
              if (!oldScene) return null;
              
              // Get index of scene in respective version
              const oldIndex = oldVersion.scenes.findIndex(scene => scene.id === newScene.id);
              const newIndex = newVersion.scenes.findIndex(scene => scene.id === newScene.id);
              
              return (
                <div key={newScene.id} className="border-l-2 border-amber-500 pl-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Scene #{oldIndex + 1} → Scene #{newIndex + 1}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Loop through all elements from both scenes and show changes */}
                    {newScene.elements.map((newElement, eIndex) => {
                      const oldElement = oldScene.elements[eIndex];
                      const isElementChanged = !oldElement || 
                        oldElement.type !== newElement.type || 
                        oldElement.content !== newElement.content;
                      const isElementAdded = !oldElement;
                      
                      if (!isElementChanged) return null;
                      
                      return (
                        <div key={eIndex} className="flex flex-col gap-1">
                          {isElementAdded ? (
                            <div className="flex items-center gap-2">
                              <PlusCircle className="h-4 w-4 text-green-500" />
                              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded border-l-2 border-green-500 flex-1">
                                <p className="text-xs text-muted-foreground">{newElement.type}</p>
                                <p className="text-sm">{newElement.content}</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <MinusCircle className="h-4 w-4 text-red-500" />
                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded border-l-2 border-red-500 flex-1">
                                  <p className="text-xs text-muted-foreground">{oldElement.type}</p>
                                  <p className="text-sm">{oldElement.content}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4 text-green-500" />
                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded border-l-2 border-green-500 flex-1">
                                  <p className="text-xs text-muted-foreground">{newElement.type}</p>
                                  <p className="text-sm">{newElement.content}</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Show removed elements that are in old scene but not in new */}
                    {oldScene.elements.slice(newScene.elements.length).map((oldElement, eIndex) => (
                      <div key={`removed-${eIndex}`} className="flex items-center gap-2">
                        <MinusCircle className="h-4 w-4 text-red-500" />
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded border-l-2 border-red-500 flex-1">
                          <p className="text-xs text-muted-foreground">{oldElement.type}</p>
                          <p className="text-sm">{oldElement.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {addedScenes.length === 0 && removedScenes.length === 0 && modifiedScenes.length === 0 && (
          <div className="text-center p-6 border rounded-md bg-muted/30">
            <p>No changes to scenes between these versions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptDiffViewer;
