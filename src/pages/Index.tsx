
import React from "react";
import { ScriptProvider } from "@/contexts/ScriptContext";
import ScriptEditor from "@/components/ScriptEditor";
import { ThemeProvider } from "@/hooks/use-theme";

const Index: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <ScriptProvider>
        <ScriptEditor />
      </ScriptProvider>
    </ThemeProvider>
  );
};

export default Index;
