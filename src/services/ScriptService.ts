
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
  };

  const updateScript = async (
    scriptId: string,
    title: string,
    author: string,
    scenes: Scene[]
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    await updateDoc(doc(db, "scripts", scriptId), {
      title,
      author,
      scenes,
      updatedAt: Timestamp.now()
    });
  };

  const getUserScripts = async () => {
    if (!user) throw new Error("User not authenticated");
    
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
  };

  const getScriptById = async (scriptId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    const scriptDoc = await getDoc(doc(db, "scripts", scriptId));
    
    if (scriptDoc.exists()) {
      return scriptDoc.data();
    }
    
    return null;
  };

  const deleteScript = async (scriptId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    await deleteDoc(doc(db, "scripts", scriptId));
  };

  return {
    saveScript,
    updateScript,
    getUserScripts,
    getScriptById,
    deleteScript
  };
};
