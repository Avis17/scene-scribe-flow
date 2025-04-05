
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { ScriptProvider } from "./contexts/ScriptContext";
import { ThemeProvider } from "@/hooks/use-theme";
import AuthGuard from "./components/AuthGuard";

import Index from "./pages/Index";
import Login from "./pages/Login";
import ScriptsList from "./pages/ScriptsList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseProvider>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/" 
                element={
                  <ScriptProvider>
                    <Index />
                  </ScriptProvider>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <AuthGuard requireAuth={false}>
                    <Login />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/scripts" 
                element={
                  <AuthGuard>
                    <ScriptProvider>
                      <ScriptsList />
                    </ScriptProvider>
                  </AuthGuard>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </FirebaseProvider>
  </QueryClientProvider>
);

export default App;
