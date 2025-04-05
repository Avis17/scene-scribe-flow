
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, FileLock, FileDown, Eye, Edit } from "lucide-react";
import { ScriptVisibility, ScriptAccessLevel } from "@/services/ScriptService";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "@/contexts/FirebaseContext";

interface ScriptData {
  id: string;
  title: string;
  author: string;
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
  
  // Determine access level for the shared script
  const accessLevel = user?.email && script.sharedWith?.[user.email]
    ? script.sharedWith[user.email].accessLevel as ScriptAccessLevel
    : "view"; // Default to view if not specified
  
  // Check if user has edit permission
  const hasEditAccess = accessLevel === "edit";
  
  console.log("Shared script access level:", accessLevel, "for script:", script.title);
  
  const handleView = () => {
    navigate(`/view/${script.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
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
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(script.updatedAt.toDate())}
        </p>
        <p className="text-sm text-muted-foreground">
          Created: {formatDate(script.createdAt.toDate())}
        </p>
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
          
          {/* Export button - always show */}
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
        </div>
      </CardFooter>
    </Card>
  );
};

export default SharedScriptCard;
