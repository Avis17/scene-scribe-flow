
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { ScriptProvider } from "./contexts/ScriptContext";
import { ThemeProvider } from "@/hooks/use-theme";
import AuthGuard from "./components/AuthGuard";
import Footer from "./components/Footer";

import Index from "./pages/Index";
import Login from "./pages/Login";
import ScriptsList from "./pages/ScriptsList";
import ScriptViewer from "./pages/ScriptViewer";
import NotFound from "./pages/NotFound";

// Create a stable QueryClient instance that won't be recreated on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <div className="flex-grow overflow-y-auto pb-16">
                  <Routes>
                    <Route 
                      path="/" 
                      element={<Navigate to="/scripts" replace />} 
                    />
                    <Route 
                      path="/editor" 
                      element={
                        <AuthGuard>
                          <ScriptProvider>
                            <Index />
                          </ScriptProvider>
                        </AuthGuard>
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
                    <Route 
                      path="/view/:scriptId" 
                      element={
                        <AuthGuard>
                          <ScriptProvider>
                            <ScriptViewer />
                          </ScriptProvider>
                        </AuthGuard>
                      } 
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Footer />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </FirebaseProvider>
    </QueryClientProvider>
  );
};

export default App;
