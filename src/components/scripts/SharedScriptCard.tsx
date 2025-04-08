import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, FileLock, FileDown, Eye, Edit, Users, Clock, User } from "lucide-react";
import { ScriptVisibility, ScriptAccessLevel, ScriptData } from "@/services/ScriptService";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "@/contexts/FirebaseContext";

interface SharedScriptCardProps {
  script: ScriptData;
  onOpen: (scriptId: string) => void;
  onExport: (scriptId: string, title: string) => void;
  formatDate: (date: Date) => string;
}

const SharedScriptCard: React.FC<SharedScriptCardProps> = ({ 
  script, 
  onOpen, 
  onExport, 
  formatDate 
}) => {
  const navigate = useNavigate();
  const { user } = useFirebase();
  
  const accessLevel = user?.email && script.sharedWith && script.sharedWith[user.email]
    ? script.sharedWith[user.email].accessLevel as ScriptAccessLevel
    : "view"; // Default to view if not specified
  
  const hasEditAccess = accessLevel === "edit";
  
  const isProtected = script.visibility === "protected";
  
  const showExportButton = !isProtected;
  
  const handleView = () => {
    navigate(`/view/${script.id}`);
  };

  const getDisplayName = (emailOrName: string) => {
    if (emailOrName?.includes('@')) {
      return emailOrName.split('@')[0];
    }
    return emailOrName || "Unknown";
  };

  const lastEditedByDisplay = script.lastEditedBy ? getDisplayName(script.lastEditedBy) : getDisplayName(script.author);

  return (
    <Card className="group hover:border-blue-300 transition-all duration-200 border-2 border-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent dark:border-blue-900/30">
      <CardHeader onClick={() => onOpen(script.id)} className="cursor-pointer group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 rounded-t-lg transition-colors">
        <CardTitle className="flex items-center flex-wrap gap-2">
          {script.visibility === "protected" ? (
            <FileLock className="h-5 w-5 mr-1 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          ) : (
            <File className="h-5 w-5 mr-1 flex-shrink-0 text-blue-500 dark:text-blue-400" />
          )}
          <span className="truncate">{script.title || "Untitled Screenplay"}</span>
          <span className="flex items-center text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 p-1 px-2 rounded-sm font-medium whitespace-nowrap">
            <Users className="h-3 w-3 mr-1" /> 
            Shared 
            {accessLevel && (
              <span className="ml-1">({accessLevel === "edit" ? "Edit" : "View"})</span>
            )}
          </span>
        </CardTitle>
        <CardDescription>
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate">{script.author || "Unknown Author"}</span>
            {script.visibility === "protected" && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/50 p-1 px-2 rounded-sm text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap">
                Protected
              </span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 cursor-pointer" onClick={() => onOpen(script.id)}>
        <div className="space-y-2 pt-2">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Last updated: {formatDate(script.updatedAt.toDate())}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" /> Last edited by: {lastEditedByDisplay}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Created: {formatDate(script.createdAt.toDate())}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-4 border-t dark:border-slate-800">
        <div className="grid grid-cols-1 gap-2 w-full">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleView}
              type="button"
              className="w-full bg-white dark:bg-slate-900 group-hover:border-blue-300 transition-colors"
            >
              <Eye className="h-4 w-4 mr-1" />
              <span>View</span>
            </Button>
            
            {hasEditAccess && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onOpen(script.id)}
                type="button"
                className="w-full bg-white dark:bg-slate-900 group-hover:border-blue-300 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span>Edit</span>
              </Button>
            )}
          </div>
          
          {showExportButton && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onExport(script.id, script.title)}
              type="button"
              className="w-full bg-white dark:bg-slate-900 group-hover:border-blue-300 transition-colors"
            >
              <FileDown className="h-4 w-4 mr-1" />
              <span>Export</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SharedScriptCard;
