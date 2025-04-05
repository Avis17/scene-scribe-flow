
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const LoadingState: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </CardContent>
          <CardFooter>
            <div className="h-8 bg-muted rounded w-full"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default LoadingState;
