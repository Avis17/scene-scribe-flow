
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

export const useScriptService = () => {
  const { db, user } = useFirebase();

  const saveScript = async (
    title: string,
    author: string,
    scenes: Scene[]
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
    scenes: Scene[]
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      await updateDoc(doc(db, "scripts", scriptId), {
        title,
        author,
        scenes,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error updating script:", error);
      throw new Error("Firebase permission error: Please check your Firebase security rules to allow write access for authenticated users.");
    }
  };

  const getUserScripts = async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const scriptsQuery = query(
        collection(db, "scripts"),
        where("userId", "==", user.uid)
      );
      
      const querySnapshot = await getDocs(scriptsQuery);
      const scripts: any[] = [];
      
      querySnapshot.forEach((doc) => {
        scripts.push(doc.data());
      });
      
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

  return {
    saveScript,
    updateScript,
    getUserScripts,
    getScriptById,
    deleteScript
  };
};
