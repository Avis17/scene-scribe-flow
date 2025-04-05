
import React from "react";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";

interface EmptyStateProps {
  searchQuery: string;
  onCreateNew: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, onCreateNew }) => {
  return (
    <div className="text-center py-12">
      <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h2 className="text-2xl font-medium mb-2">No scripts found</h2>
      <p className="text-muted-foreground mb-6">
        {searchQuery 
          ? "No scripts match your search criteria." 
          : "You haven't created any scripts yet. Get started by creating your first script."
        }
      </p>
      <Button onClick={onCreateNew} type="button">
        <File className="mr-2 h-4 w-4" />
        Create New Script
      </Button>
    </div>
  );
};

export default EmptyState;
