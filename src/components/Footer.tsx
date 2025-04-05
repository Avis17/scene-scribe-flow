
import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t py-4 text-center text-sm text-muted-foreground bg-background">
      <div className="container mx-auto">
        <p>© {currentYear} Scriptly. All rights reserved.</p>
        <p className="mt-1">Developer - Siva (Kuat Technologies) Powered By Semma Clicks Studio</p>
      </div>
    </footer>
  );
};

export default Footer;
