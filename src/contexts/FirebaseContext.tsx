
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  initializeApp, 
  FirebaseApp 
} from "firebase/app";
import { 
  getAuth, 
  Auth,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { useToast } from "@/hooks/use-toast";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5NjDaca5skDecP09XNzy1uqvoxAvNsMM",
  authDomain: "scriptly-c27ff.firebaseapp.com",
  projectId: "scriptly-c27ff",
  storageBucket: "scriptly-c27ff.firebasestorage.app",
  messagingSenderId: "640088332181",
  appId: "1:640088332181:web:7ecdc96d8d2209373c489c",
  measurementId: "G-5FKRBSY4N9"
};

interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  // Set persistence to LOCAL (browser persistence)
  useEffect(() => {
    const setupPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        // Error handling without console.log
      }
    };
    
    setupPersistence();
  }, [auth]);
  
  // Initialize Analytics in browser environment
  if (typeof window !== 'undefined') {
    getAnalytics(app);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Force authorization even if the user has already granted it
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Check for unauthorized domain error
      if (error.code === 'auth/unauthorized-domain') {
        toast({
          title: "Unauthorized Domain",
          description: "This domain is not authorized for authentication. Please add it in Firebase console under Authentication > Sign-in method > Authorized domains.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Google Sign-in Failed",
          description: error.message || "Failed to sign in with Google",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const value = {
    app,
    auth,
    db,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
