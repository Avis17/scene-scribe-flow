
import React from "react";
import AppLogo from "./components/AppLogo";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="fixed bottom-0 border-t py-4 text-center text-sm text-muted-foreground bg-background w-full">
      <div className="container mx-auto flex flex-col items-center">
        <AppLogo size="sm" className="mb-2" />
        <p>© {currentYear} Scriptly. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
