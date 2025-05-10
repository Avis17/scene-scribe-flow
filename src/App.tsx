
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { AdminProvider } from "./contexts/AdminContext";
import { ScriptProvider } from "./contexts/ScriptContext";
import { ThemeProvider } from "./hooks/use-theme";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import Admin from "./pages/Admin";
import ScriptsList from "./pages/ScriptsList";
import ScriptViewer from "./pages/ScriptViewer";
import "./App.css";
import MainLayout from "./MainLayout";

function App() {
  useEffect(() => {
    // Set the title of the document
    document.title = "Scriptly - Screenplay Editor";
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="scriptly-theme">
      <FirebaseProvider>
        <AdminProvider>
          <ScriptProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/scripts"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <ScriptsList />
                      </MainLayout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/editor"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <Index />
                      </MainLayout>                    </AuthGuard>
                  }
                />
                <Route
                  path="/view/:scriptId"
                  element={
                    <MainLayout>
                      <ScriptViewer />
                    </MainLayout>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <MainLayout>
                      <Admin />
                    </MainLayout>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </BrowserRouter>
          </ScriptProvider>
        </AdminProvider>
      </FirebaseProvider>
    </ThemeProvider>
  );
}

export default App;
