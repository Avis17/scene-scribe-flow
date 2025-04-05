import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc, 
  query, 
  where,
  updateDoc,
  Timestamp
} from "firebase/firestore";
import { useFirebase } from "@/contexts/FirebaseContext";
import { Scene, SceneElement } from "@/contexts/ScriptContext";

export type ScriptVisibility = "public" | "protected" | "private";
export type ScriptAccessLevel = "view" | "edit";

export interface ScriptSharing {
  email: string;
  accessLevel: ScriptAccessLevel;
  sharedAt: any; // Timestamp
  password?: string; // Optional password for protected scripts
}

export const useScriptService = () => {
  const { db, user } = useFirebase();

  const saveScript = async (
    title: string,
    author: string,
    scenes: Scene[],
    visibility: ScriptVisibility = "public"
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const scriptId = `script_${Date.now()}`;
      
      await setDoc(doc(db, "scripts", scriptId), {
        id: scriptId,
        title,
        author,
        scenes,
        userId: user.uid,
        visibility,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        sharedWith: {} // Initialize empty object for shared users
      });
      
      return scriptId;
    } catch (error) {
      console.error("Error saving script:", error);
      throw new Error("Failed to save script. Please try again.");
    }
  };

  const updateScript = async (
    scriptId: string,
    title: string,
    author: string,
    scenes: Scene[],
    visibility?: ScriptVisibility
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const updateData: any = {
        title,
        author,
        scenes,
        updatedAt: Timestamp.now()
      };
      
      if (visibility) {
        updateData.visibility = visibility;
      }
      
      await updateDoc(doc(db, "scripts", scriptId), updateData);
    } catch (error) {
      console.error("Error updating script:", error);
      throw new Error("Failed to update script. Please try again.");
    }
  };

  const getUserScripts = async (includeProtected: boolean = false) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      let scripts: any[] = [];
      
      // First get the user's own scripts
      const userScriptsQuery = query(
        collection(db, "scripts"),
        where("userId", "==", user.uid)
      );
      
      const userScriptsSnapshot = await getDocs(userScriptsQuery);
      userScriptsSnapshot.forEach((doc) => {
        scripts.push(doc.data());
      });
      
      console.log("User's own scripts:", scripts.length);
      
      // Get scripts shared with the user by email
      if (user.email) {
        try {
          // This query looks for documents where the user's email exists
          // in the sharedWith object's keys
          const allScriptsSnapshot = await getDocs(collection(db, "scripts"));
          
          const sharedScripts = allScriptsSnapshot.docs
            .map(doc => doc.data())
            .filter(script => 
              script.sharedWith && 
              script.sharedWith[user.email] && 
              // Don't include scripts the user already owns
              script.userId !== user.uid
            );
          
          console.log("Scripts shared with user:", sharedScripts.length);
          
          // Add the shared scripts to the scripts array
          scripts = [...scripts, ...sharedScripts];
        } catch (error) {
          console.error("Error fetching shared scripts:", error);
          // Continue with user's own scripts
        }
      }
      
      return scripts;
    } catch (error) {
      console.error("Error fetching scripts:", error);
      throw new Error("Failed to fetch scripts. Please try again.");
    }
  };

  const getScriptById = async (scriptId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const scriptDoc = await getDoc(doc(db, "scripts", scriptId));
      
      if (scriptDoc.exists()) {
        return scriptDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error("Error getting script:", error);
      throw new Error("Failed to get script. Please try again.");
    }
  };

  const deleteScript = async (scriptId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      await deleteDoc(doc(db, "scripts", scriptId));
    } catch (error) {
      console.error("Error deleting script:", error);
      throw new Error("Failed to delete script. Please try again.");
    }
  };

  const updateScriptVisibility = async (scriptId: string, visibility: ScriptVisibility) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      await updateDoc(doc(db, "scripts", scriptId), {
        visibility,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error updating script visibility:", error);
      throw new Error("Failed to update script visibility. Please try again.");
    }
  };

  // Function to share a script with another user
  const shareScript = async (
    scriptId: string, 
    email: string, 
    accessLevel: ScriptAccessLevel,
    password?: string // Optional password for protected scripts
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const scriptDoc = await getDoc(doc(db, "scripts", scriptId));
      
      if (!scriptDoc.exists()) {
        throw new Error("Script not found");
      }
      
      const scriptData = scriptDoc.data();
      
      // Check if the current user is the owner of the script
      if (scriptData.userId !== user.uid) {
        throw new Error("You don't have permission to share this script");
      }
      
      // Create or update the shared user entry
      const sharedWith = scriptData.sharedWith || {};
      sharedWith[email] = {
        accessLevel,
        sharedAt: Timestamp.now()
      };
      
      // If this is a protected script and a password is provided, store it
      if (scriptData.visibility === "protected" && password) {
        sharedWith[email].password = password;
      }
      
      await updateDoc(doc(db, "scripts", scriptId), {
        sharedWith,
        updatedAt: Timestamp.now()
      });
      
      return true;
    } catch (error) {
      console.error("Error sharing script:", error);
      throw error;
    }
  };

  // Remove sharing for a specific user
  const removeScriptSharing = async (scriptId: string, email: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const scriptDoc = await getDoc(doc(db, "scripts", scriptId));
      
      if (!scriptDoc.exists()) {
        throw new Error("Script not found");
      }
      
      const scriptData = scriptDoc.data();
      
      // Check if the current user is the owner of the script
      if (scriptData.userId !== user.uid) {
        throw new Error("You don't have permission to modify sharing for this script");
      }
      
      // Create a new sharedWith object without the specified email
      const sharedWith = { ...scriptData.sharedWith };
      if (sharedWith && sharedWith[email]) {
        delete sharedWith[email];
      }
      
      await updateDoc(doc(db, "scripts", scriptId), {
        sharedWith,
        updatedAt: Timestamp.now()
      });
      
      return true;
    } catch (error) {
      console.error("Error removing script sharing:", error);
      throw error;
    }
  };

  // Get all users that a script is shared with
  const getScriptSharing = async (scriptId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const scriptDoc = await getDoc(doc(db, "scripts", scriptId));
      
      if (!scriptDoc.exists()) {
        throw new Error("Script not found");
      }
      
      const scriptData = scriptDoc.data();
      
      // Check if the current user is the owner of the script
      if (scriptData.userId !== user.uid) {
        throw new Error("You don't have permission to view sharing for this script");
      }
      
      const sharedWith = scriptData.sharedWith || {};
      
      // Convert to array format with email included and include password if available
      return Object.keys(sharedWith).map(email => ({
        email,
        accessLevel: sharedWith[email].accessLevel,
        sharedAt: sharedWith[email].sharedAt,
        password: sharedWith[email].password // Include the password field
      }));
    } catch (error) {
      console.error("Error getting script sharing:", error);
      throw error;
    }
  };

  return {
    saveScript,
    updateScript,
    getUserScripts,
    getScriptById,
    deleteScript,
    updateScriptVisibility,
    shareScript,
    removeScriptSharing,
    getScriptSharing
  };
};
