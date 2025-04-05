import React, { useState, useEffect } from "react";
import { useScript } from "@/contexts/ScriptContext";
import { useScriptService, ScriptVersion } from "@/services/ScriptService";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  History, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  RotateCcw,
  DiffIcon,
  User,
  Calendar,
  ArrowUpDown,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ScriptDiffViewer from "./ScriptDiffViewer";
import { formatDistanceToNow } from "date-fns";

interface ScriptVersionHistoryProps {
  scriptId: string;
}

const ScriptVersionHistory: React.FC<ScriptVersionHistoryProps> = ({ scriptId }) => {
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ScriptVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<ScriptVersion | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const scriptService = useScriptService();
  const { resetScript, setCurrentScriptId } = useScript();
  
  useEffect(() => {
    if (scriptId && isDialogOpen) {
      fetchVersions();
    }
  }, [scriptId, isDialogOpen, sortDirection]);
  
  const fetchVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const versionsList = await scriptService.getScriptVersions(scriptId);
      
      // Sort versions based on timestamp
      const sortedVersions = [...versionsList].sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() ? a.timestamp.toDate().getTime() : 0;
        const timeB = b.timestamp?.toDate?.() ? b.timestamp.toDate().getTime() : 0;
        return sortDirection === "desc" ? timeB - timeA : timeA - timeB;
      });
      
      setVersions(sortedVersions);
      
      if (sortedVersions.length > 0) {
        setSelectedVersion(sortedVersions[0]);
      }
    } catch (error) {
      console.error("Error fetching script versions:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load script versions";
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleSortDirection = () => {
    setSortDirection(prev => (prev === "desc" ? "asc" : "desc"));
  };
  
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
  
  const getRelativeTime = (timestamp: any) => {
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
  };
  
  const restoreVersion = (version: ScriptVersion) => {
    try {
      setCurrentScriptId(scriptId);
      // We need to manually recreate the scenes to ensure they have the same structure
      const restoredScenes = version.scenes.map(scene => ({
        id: scene.id,
        elements: scene.elements,
        isCollapsed: false, // Default to not collapsed
      }));
      
      // Update the script with the version data
      scriptService.updateScript(
        scriptId,
        version.title,
        version.author,
        restoredScenes
      );
      
      toast({
        title: "Success",
        description: `Restored version from ${getRelativeTime(version.timestamp)}`,
      });
      
      setIsDialogOpen(false);
      
      // Reload the page to show the restored version
      window.location.href = `/`;
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive",
      });
    }
  };

  const getDisplayName = (emailOrName: string | null) => {
    if (!emailOrName) return "Unknown";
    if (emailOrName.includes('@')) {
      return emailOrName.split('@')[0];
    }
    return emailOrName;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <History className="h-4 w-4" />
          <span className="hidden md:inline">Version History</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <History className="h-5 w-5" />
            Script Version History
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of your script.
          </DialogDescription>
        </DialogHeader>
        
        {error && error.includes("index") && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Index Required</AlertTitle>
            <AlertDescription>
              This feature requires a Firestore database index. An administrator needs to create this index.
              <p className="mt-2">Check the browser console for the direct link to create the index in Firebase Console.</p>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
          {/* Versions list */}
          <div className="w-full md:w-1/3 border rounded-md overflow-hidden flex flex-col">
            <div className="bg-muted p-2 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Version List</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleSortDirection}
                className="h-8 px-2"
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                {sortDirection === "desc" ? "Newest first" : "Oldest first"}
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <p>Loading versions...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-red-500 mb-4">Error loading versions</p>
                  <Button onClick={fetchVersions} variant="outline">Retry</Button>
                </div>
              ) : versions.length === 0 ? (
                <div className="p-8 text-center">
                  <p>No version history available.</p>
                </div>
              ) : (
                <div className="p-1">
                  {versions.map((version, index) => (
                    <div 
                      key={version.versionId}
                      className={`p-2 my-1 rounded-md cursor-pointer hover:bg-accent flex flex-col ${
                        (selectedVersion?.versionId === version.versionId || compareVersion?.versionId === version.versionId) 
                          ? 'bg-accent' 
                          : ''
                      }`}
                      onClick={() => {
                        // If already selected, set as compare version
                        if (selectedVersion?.versionId === version.versionId) {
                          setSelectedVersion(compareVersion);
                          setCompareVersion(null);
                        } else if (compareVersion?.versionId === version.versionId) {
                          setCompareVersion(null);
                        } else if (!selectedVersion) {
                          setSelectedVersion(version);
                        } else if (!compareVersion) {
                          setCompareVersion(version);
                        } else {
                          setSelectedVersion(version);
                          setCompareVersion(null);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm truncate">
                          {index === 0 && sortDirection === "desc" && (
                            <Badge variant="outline" className="mr-1">Latest</Badge>
                          )}
                          {version.title}
                        </div>
                        {selectedVersion?.versionId === version.versionId && (
                          <Badge variant="secondary">Selected</Badge>
                        )}
                        {compareVersion?.versionId === version.versionId && (
                          <Badge variant="secondary">Compare</Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {getDisplayName(version.editor)}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {getRelativeTime(version.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Version details */}
          <div className="flex-1 border rounded-md overflow-hidden flex flex-col">
            <div className="bg-muted p-2">
              <h3 className="font-semibold text-sm">
                {compareVersion 
                  ? "Version Comparison" 
                  : selectedVersion 
                    ? "Version Details" 
                    : "Select a Version"
                }
              </h3>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              {error ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                  <p className="text-muted-foreground">Version history cannot be displayed</p>
                </div>
              ) : !selectedVersion ? (
                <div className="p-8 text-center">
                  <p>Select a version to view details</p>
                </div>
              ) : compareVersion ? (
                <ScriptDiffViewer 
                  oldVersion={compareVersion} 
                  newVersion={selectedVersion} 
                />
              ) : (
                <div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold">{selectedVersion.title}</h3>
                      <p className="text-sm text-muted-foreground">by {selectedVersion.author}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Edited by</p>
                        <p className="text-sm">{selectedVersion.editor || "Unknown"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm">{formatDate(selectedVersion.timestamp)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Scenes Summary</h4>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Scene</TableHead>
                              <TableHead>Elements</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedVersion.scenes.map((scene, sceneIndex) => (
                              <TableRow key={scene.id}>
                                <TableCell className="font-medium">Scene {sceneIndex + 1}</TableCell>
                                <TableCell>{scene.elements.length} elements</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Content Preview</h4>
                      <div className="border rounded-md p-3 bg-muted/50 max-h-40 overflow-y-auto">
                        {selectedVersion.scenes.map((scene, sceneIndex) => (
                          <div key={scene.id} className="mb-3">
                            {scene.elements.slice(0, 2).map((element, elementIndex) => (
                              <div key={elementIndex} className={element.type}>
                                {element.content}
                              </div>
                            ))}
                            {scene.elements.length > 2 && (
                              <div className="text-muted-foreground text-sm">
                                ...and {scene.elements.length - 2} more elements
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
            
            <div className="p-2 border-t bg-muted/50 flex justify-between">
              <div className="flex gap-2">
                {selectedVersion && !error && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => restoreVersion(selectedVersion)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore This Version
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {selectedVersion && !compareVersion && versions.length > 1 && !error && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // Find the next version to compare with
                      const currentIndex = versions.findIndex(v => v.versionId === selectedVersion.versionId);
                      const compareIndex = currentIndex === versions.length - 1 ? currentIndex - 1 : currentIndex + 1;
                      setCompareVersion(versions[compareIndex]);
                    }}
                  >
                    <DiffIcon className="h-4 w-4 mr-2" />
                    Compare
                  </Button>
                )}
                
                {compareVersion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCompareVersion(null)}
                  >
                    Cancel Comparison
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {error && error.includes("index") && (
          <DialogFooter className="mt-4 border-t pt-4">
            <div className="text-sm text-muted-foreground flex flex-col w-full">
              <p className="mb-2">To resolve this issue:</p>
              <ol className="list-decimal list-inside space-y-1 mb-2">
                <li>Check the browser console for the direct link to create the Firestore index</li>
                <li>Follow the link to the Firebase Console</li>
                <li>Create the required index</li>
                <li>Wait a few minutes for the index to be created</li>
                <li>Try again</li>
              </ol>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScriptVersionHistory;
