
import React, { useState } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Mail, Lock, Eye, EyeOff, Smartphone, Users } from "lucide-react";
import AppLogo from "@/components/AppLogo";
import { useIsMobile } from "@/hooks/use-mobile";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useFirebase();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        await signUp(email, password);
        toast({
          title: "Success",
          description: "Account created successfully",
        });
      }
      navigate("/scripts");
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      let errorMessage = "Authentication failed";
      
      // Handle specific error codes
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "User not found";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email is already in use";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized. Please contact your administrator.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast({
        title: "Success",
        description: "Logged in successfully with Google",
      });
      navigate("/scripts");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      // Error handling is now centralized in FirebaseContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      {/* Feature showcase section */}
      <div className={`w-full ${isMobile ? 'mb-6' : 'md:w-1/2'} p-6 flex flex-col justify-center animate-fade-in`}>
        <div className="text-center md:text-left mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
            Scriptly
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-6">
            Your professional screenplay writing assistant
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="flex flex-col items-center md:items-start p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Collaborative Writing</h3>
              <p className="text-slate-600 dark:text-slate-400 text-center md:text-left">
                Share scripts with teammates and collaborate in real-time
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-start p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full mb-4">
                <Smartphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Mobile Ready</h3>
              <p className="text-slate-600 dark:text-slate-400 text-center md:text-left">
                Write and edit your screenplays on any device, anytime
              </p>
            </div>
          </div>
          
          <div className="mt-10 space-y-6">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-3"></div>
              <p className="text-slate-700 dark:text-slate-300">Industry-standard screenplay formatting</p>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-3"></div>
              <p className="text-slate-700 dark:text-slate-300">Export to PDF with professional layouts</p>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-3"></div>
              <p className="text-slate-700 dark:text-slate-300">Secure cloud storage for all your scripts</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login/Signup card */}
      <div className={`w-full ${isMobile ? '' : 'md:w-1/2'} flex justify-center items-center`}>
        <Card className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <AppLogo size="lg" />
            </div>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-purple-400">
              {isLogin ? "Welcome Back" : "Join Scriptly"}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {isLogin ? "Sign in to your account to continue" : "Create a new account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-blue-500 dark:focus:ring-blue-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-blue-500 dark:focus:ring-blue-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 text-white shadow-md"
                disabled={loading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>

            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="48px"
                height="48px"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
