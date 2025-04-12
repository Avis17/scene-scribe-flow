
import React from "react";
import AppLogo from "./AppLogo";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-20 border-t py-4 text-center text-sm text-muted-foreground bg-background w-full">
      <div className="container mx-auto flex flex-col items-center">
        <AppLogo size="sm" className="mb-2" />
        <p>© {currentYear} Scriptly. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
