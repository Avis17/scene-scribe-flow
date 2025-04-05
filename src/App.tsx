
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { ScriptProvider } from "./contexts/ScriptContext";
import { AdminProvider } from "./contexts/AdminContext";
import { ThemeProvider } from "@/hooks/use-theme";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import Footer from "./components/Footer";

import Index from "./pages/Index";
import Login from "./pages/Login";
import ScriptsList from "./pages/ScriptsList";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a new QueryClient for each rendering - avoids sharing client across renders
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider>
        <AdminProvider>
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
                        path="/admin" 
                        element={
                          <AuthGuard>
                            <AdminGuard>
                              <ScriptProvider>
                                <Admin />
                              </ScriptProvider>
                            </AdminGuard>
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
        </AdminProvider>
      </FirebaseProvider>
    </QueryClientProvider>
  );
};

export default App;
