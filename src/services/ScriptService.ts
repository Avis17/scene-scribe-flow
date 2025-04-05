
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
  arrayRemove,
  arrayUnion,
  Timestamp
} from "firebase/firestore";
import { useFirebase } from "@/contexts/FirebaseContext";
import { Scene, SceneElement } from "@/contexts/ScriptContext";

export type ScriptVisibility = "public" | "protected" | "private";

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
        updatedAt: Timestamp.now()
      });
      
      return scriptId;
    } catch (error) {
      console.error("Error saving script:", error);
      throw new Error("Firebase permission error: Please check your Firebase security rules to allow write access for authenticated users.");
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
      throw new Error("Firebase permission error: Please check your Firebase security rules to allow write access for authenticated users.");
    }
  };

  const getUserScripts = async (includeProtected: boolean = false) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      let scripts: any[] = [];
      
      // First get the user's own scripts (avoid the compound query that requires an index)
      const userScriptsQuery = query(
        collection(db, "scripts"),
        where("userId", "==", user.uid)
      );
      
      const userScriptsSnapshot = await getDocs(userScriptsQuery);
      userScriptsSnapshot.forEach((doc) => {
        scripts.push(doc.data());
      });
      
      console.log("User's own scripts:", scripts.length);
      
      // If admin, also get all protected scripts not owned by the user
      if (includeProtected) {
        console.log("Admin user - fetching protected scripts");
        const protectedQuery = query(
          collection(db, "scripts"),
          where("visibility", "==", "protected")
        );
        
        const protectedSnapshot = await getDocs(protectedQuery);
        let protectedCount = 0;
        
        protectedSnapshot.forEach((doc) => {
          // Don't add duplicates (user's own protected scripts)
          const data = doc.data();
          if (data.userId !== user.uid && !scripts.some(script => script.id === doc.id)) {
            scripts.push(data);
            protectedCount++;
          }
        });
        
        console.log(`Added ${protectedCount} protected scripts from other users`);
      }
      
      return scripts;
    } catch (error) {
      console.error("Error fetching scripts:", error);
      throw new Error("Firebase permission error: Please check your Firebase security rules to allow read access for authenticated users.");
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
      throw new Error("Firebase permission error: Please check your Firebase security rules to allow read access for authenticated users.");
    }
  };

  const deleteScript = async (scriptId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      await deleteDoc(doc(db, "scripts", scriptId));
    } catch (error) {
      console.error("Error deleting script:", error);
      throw new Error("Firebase permission error: Please check your Firebase security rules to allow delete access for authenticated users.");
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
      throw new Error("Firebase permission error: Please check your Firebase security rules to allow update access for authenticated users.");
    }
  };

  return {
    saveScript,
    updateScript,
    getUserScripts,
    getScriptById,
    deleteScript,
    updateScriptVisibility
  };
};
