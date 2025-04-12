
import React from "react";
import AppLogo from "./AppLogo";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t py-4 text-center text-sm text-muted-foreground bg-background w-full fixed bottom-0 left-0 right-0 z-0">
      <div className="container mx-auto flex flex-col items-center">
        <AppLogo size="sm" className="mb-2" />
        <p>© {currentYear} Scriptly. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
