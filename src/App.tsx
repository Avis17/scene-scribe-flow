
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { AdminProvider } from "./contexts/AdminContext";
import { ScriptProvider } from "./contexts/ScriptContext";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import Admin from "./pages/Admin";
import ScriptsList from "./pages/ScriptsList";
import ScriptViewer from "./pages/ScriptViewer";
import Footer from "./Footer";
import "./App.css";

function App() {
  useEffect(() => {
    // Set the title of the document
    document.title = "Scriptly - Screenplay Editor";
  }, []);

  return (
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
                    <ScriptsList />
                  </AuthGuard>
                }
              />
              <Route
                path="/editor"
                element={
                  <AuthGuard>
                    <Index />
                  </AuthGuard>
                }
              />
              <Route
                path="/view/:scriptId"
                element={
                  <AuthGuard>
                    <ScriptViewer />
                  </AuthGuard>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <Admin />
                  </AdminGuard>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
            <Toaster />
          </BrowserRouter>
        </ScriptProvider>
      </AdminProvider>
    </FirebaseProvider>
  );
}

export default App;
