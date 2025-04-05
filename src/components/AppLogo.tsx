
import React from "react";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ 
  size = "md",
  className = ""
}) => {
  // Set size based on prop
  const dimensions = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/5f7596a1-46d5-4212-bc40-4affa5bcbf40.png" 
        alt="Scriptly Logo" 
        className={`${dimensions[size]} mr-2`}
      />
      <span className="font-bold text-primary">Scriptly</span>
    </div>
  );
};

export default AppLogo;
