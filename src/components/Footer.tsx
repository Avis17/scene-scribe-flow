
import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="fixed bottom-0 border-t py-4 text-center text-sm text-muted-foreground bg-background w-full">
      <div className="container mx-auto">
        <p>© {currentYear} Semma Clicks Studio - Scriptly. All rights reserved.</p>
        <p className="mt-1">Developer - Siva (Kuat Technologies) Powered By Semma Clicks Studio</p>
      </div>
    </footer>
  );
};

export default Footer;
