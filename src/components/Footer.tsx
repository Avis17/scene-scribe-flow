
import React from "react";
import AppLogo from "./AppLogo";
import { useLocation } from "react-router-dom";

const Footer: React.FC = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Don't show footer on editor page to avoid interference
  const isEditorPage = location.pathname === "/editor";

  if (isEditorPage) {
    return null;
  }

  return (
    <footer className="border-t py-4 text-center text-sm text-muted-foreground bg-background w-full mt-32 sticky bottom-0 z-0">
      <div className="container mx-auto flex flex-col items-center">
        <AppLogo size="sm" className="mb-2" />
        <p>© {currentYear} Scriptly. All rights reserved.</p>
        <div>Developed by Siva - Kuat Technologies</div>
      </div>
    </footer>
  );
};

export default Footer;
