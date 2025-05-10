
import React from "react";
import AppLogo from "./components/AppLogo";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 w-full border-t bg-background text-muted-foreground py-4 z-20">
      <div className="mx-auto flex flex-col items-center justify-center text-center max-w-full px-4">

        <AppLogo size="sm" className="mb-2" />
        <div>Developed by Siva - Kuat Technologies</div>
        <p>© {currentYear} Scriptly. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
