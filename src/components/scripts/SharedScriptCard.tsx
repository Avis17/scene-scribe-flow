
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, FileLock, FileDown, Eye, Edit, Users, Clock, User } from "lucide-react";
import { ScriptVisibility, ScriptAccessLevel } from "@/services/ScriptService";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "@/contexts/FirebaseContext";

interface ScriptData {
  id: string;
  title: string;
  author: string;
  lastEditedBy?: string;
  visibility?: ScriptVisibility;
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
  userId?: string;
  sharedWith?: Record<string, any>;
}

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
  
  // Debug the sharedWith property
  console.log("SharedScriptCard - script:", script.title);
  console.log("SharedScriptCard - sharedWith:", script.sharedWith);
  console.log("SharedScriptCard - user email:", user?.email);
  
  // Determine access level for the shared script - ensure we're accessing it correctly
  const accessLevel = user?.email && script.sharedWith && script.sharedWith[user.email]
    ? script.sharedWith[user.email].accessLevel as ScriptAccessLevel
    : "view"; // Default to view if not specified
  
  console.log("Shared script access level:", accessLevel, "for script:", script.title);
  
  // Check if user has edit permission
  const hasEditAccess = accessLevel === "edit";
  
  // Check if script is protected
  const isProtected = script.visibility === "protected";
  
  // Hide export button if script is protected
  const showExportButton = !isProtected;
  
  const handleView = () => {
    navigate(`/view/${script.id}`);
  };

  // Extract name from email if it's an email address
  const getDisplayName = (emailOrName: string) => {
    if (emailOrName?.includes('@')) {
      return emailOrName.split('@')[0];
    }
    return emailOrName || "Unknown";
  };

  const lastEditedByDisplay = script.lastEditedBy ? getDisplayName(script.lastEditedBy) : getDisplayName(script.author);

  return (
    <Card className="hover:shadow-md transition-shadow border-2 border-blue-200">
      <CardHeader onClick={() => onOpen(script.id)} className="cursor-pointer">
        <CardTitle className="flex items-center flex-wrap gap-2">
          {script.visibility === "protected" ? (
            <FileLock className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
          ) : (
            <File className="h-5 w-5 mr-1 flex-shrink-0" />
          )}
          <span className="truncate">{script.title || "Untitled Screenplay"}</span>
          <span className="flex items-center text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 p-1 px-2 rounded-sm whitespace-nowrap">
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
              <span className="text-xs bg-primary/20 p-1 px-2 rounded-sm text-primary whitespace-nowrap">
                Protected
              </span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 cursor-pointer" onClick={() => onOpen(script.id)}>
        <div className="space-y-1">
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
      <CardFooter className="flex flex-col space-y-2">
        <div className="grid grid-cols-1 gap-2 w-full">
          <div className="grid grid-cols-2 gap-2">
            {/* View button - always show */}
            <Button 
              variant="outline"
              size="sm"
              onClick={handleView}
              type="button"
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-1" />
              <span>View</span>
            </Button>
            
            {/* Edit button - only show if user has edit access */}
            {hasEditAccess && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onOpen(script.id)}
                type="button"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span>Edit</span>
              </Button>
            )}
          </div>
          
          {/* Export button - only show if script is not protected */}
          {showExportButton && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onExport(script.id, script.title)}
              type="button"
              className="w-full"
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
