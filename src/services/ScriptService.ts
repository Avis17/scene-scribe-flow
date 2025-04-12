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
  Timestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { useFirebase } from "@/contexts/FirebaseContext";
import { Scene, SceneElement } from "@/contexts/ScriptContext";
import { useToast } from "@/hooks/use-toast";

export type ScriptVisibility = "public" | "protected" | "private";
export type ScriptAccessLevel = "view" | "edit";

export interface ScriptSharing {
  email: string;
  accessLevel: ScriptAccessLevel;
  sharedAt: any;
  password?: string;
}

export interface ScriptVersion {
  timestamp: any;
  editor: string;
  title: string;
  author: string;
  scenes: Scene[];
  versionId: string;
}

export interface ScriptData {
  id: string;
  title: string;
  author: string;
  scenes: Scene[];
  userId: string;
  visibility: ScriptVisibility;
  createdAt: any;
  updatedAt: any;
  lastEditedBy: string;
  sharedWith: Record<string, any>;
}

const ADMIN_EMAIL = "studio.semmaclicks@gmail.com";

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
        lastEditedBy: user.email,
        sharedWith: {}
      });
      
      await saveScriptVersion(scriptId, title, author, scenes, user.email);
      
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
    visibility?: ScriptVisibility,
    editorEmail?: string
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const editorToRecord = editorEmail || user.email;
      
      const updateData: any = {
        title,
        author,
        scenes,
        updatedAt: Timestamp.now(),
        lastEditedBy: editorToRecord
      };
      
      if (visibility) {
        updateData.visibility = visibility;
      }
      
      await updateDoc(doc(db, "scripts", scriptId), updateData);
      
      await saveScriptVersion(scriptId, title, author, scenes, editorToRecord);
      
    } catch (error) {
      console.error("Error updating script:", error);
      throw new Error("Failed to update script. Please try again.");
    }
  };

  const saveScriptVersion = async (
    scriptId: string,
    title: string,
    author: string,
    scenes: Scene[],
    editorEmail: string | null
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const timestamp = Date.now();
      const versionId = `version_${timestamp}`;
      
      await setDoc(doc(db, "script_versions", versionId), {
        scriptId,
        versionId,
        title,
        author,
        scenes: JSON.parse(JSON.stringify(scenes)),
        timestamp: Timestamp.now(),
        editor: editorEmail || "Unknown user"
      });
      
      console.log(`Version ${versionId} saved successfully for script ${scriptId}`);
      return versionId;
    } catch (error) {
      console.error("Error saving script version:", error);
    }
  };

  const getScriptVersions = async (scriptId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      try {
        const versionsQuery = query(
          collection(db, "script_versions"),
          where("scriptId", "==", scriptId),
          orderBy("timestamp", "desc")
        );
        
        const versionsSnapshot = await getDocs(versionsQuery);
        const versions: ScriptVersion[] = [];
        
        versionsSnapshot.forEach((doc) => {
          const data = doc.data();
          versions.push({
            timestamp: data.timestamp,
            editor: data.editor,
            title: data.title,
            author: data.author,
            scenes: data.scenes,
            versionId: data.versionId
          });
        });
        
        return versions;
      } catch (indexError) {
        console.warn("Index error, falling back to simple query:", indexError);
        
        const simpleQuery = query(
          collection(db, "script_versions"),
          where("scriptId", "==", scriptId)
        );
        
        const versionsSnapshot = await getDocs(simpleQuery);
        const versions: ScriptVersion[] = [];
        
        versionsSnapshot.forEach((doc) => {
          const data = doc.data();
          versions.push({
            timestamp: data.timestamp,
            editor: data.editor,
            title: data.title,
            author: data.author,
            scenes: data.scenes,
            versionId: data.versionId
          });
        });
        
        versions.sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() ? a.timestamp.toDate().getTime() : 0;
          const timeB = b.timestamp?.toDate?.() ? b.timestamp.toDate().getTime() : 0;
          return timeB - timeA;
        });
        
        return versions;
      }
    } catch (error) {
      console.error("Error fetching script versions:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("index")) {
        throw new Error(
          "This feature requires a Firestore index. Please check the console for the link to create it, or contact the administrator."
        );
      }
      
      throw new Error("Failed to fetch script versions. Please try again.");
    }
  };

  const getScriptVersion = async (versionId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const versionDoc = await getDoc(doc(db, "script_versions", versionId));
      
      if (versionDoc.exists()) {
        const data = versionDoc.data();
        return {
          timestamp: data.timestamp,
          editor: data.editor,
          title: data.title,
          author: data.author,
          scenes: data.scenes,
          versionId: data.versionId
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching script version:", error);
      throw new Error("Failed to fetch script version. Please try again.");
    }
  };

  const getAllScripts = async () => {
    if (!user) throw new Error("User not authenticated");
    
    if (user.email !== ADMIN_EMAIL) {
      console.error("Access denied: Only admin users can view all scripts", user.email);
      throw new Error("Not authorized to view all scripts");
    }
    
    try {
      console.log("Admin user accessing all scripts:", user.email);
      
      const scriptsSnapshot = await getDocs(collection(db, "scripts"));
      const allScripts: any[] = [];
      
      scriptsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          const processedData = {
            id: doc.id,
            title: data.title || "Untitled",
            author: data.author || "Unknown",
            scenes: Array.isArray(data.scenes) ? data.scenes : [],
            userId: data.userId || "unknown",
            visibility: data.visibility || "public",
            createdAt: data.createdAt || Timestamp.now(),
            updatedAt: data.updatedAt || Timestamp.now(),
            lastEditedBy: data.lastEditedBy || "unknown",
            sharedWith: data.sharedWith || {}
          };
          
          allScripts.push(processedData);
        }
      });
      
      console.log(`Admin user ${user.email} fetched all scripts:`, allScripts.length);
      
      return allScripts;
    } catch (error) {
      console.error("Error fetching all scripts:", error);
      throw new Error("Failed to fetch all scripts. Please try again.");
    }
  };

  const getUserScripts = async (includeProtected: boolean = false) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      let scripts: ScriptData[] = [];
      
      const userScriptsQuery = query(
        collection(db, "scripts"),
        where("userId", "==", user.uid)
      );
      
      const userScriptsSnapshot = await getDocs(userScriptsQuery);
      userScriptsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          scripts.push({
            id: doc.id,
            title: data.title || "Untitled",
            author: data.author || "Unknown",
            scenes: Array.isArray(data.scenes) ? data.scenes : [],
            userId: data.userId || "unknown",
            visibility: data.visibility || "public",
            createdAt: data.createdAt || Timestamp.now(),
            updatedAt: data.updatedAt || Timestamp.now(),
            lastEditedBy: data.lastEditedBy || "unknown",
            sharedWith: data.sharedWith || {}
          });
        }
      });
      
      console.log("User's own scripts:", scripts.length);
      
      if (user.email) {
        try {
          const allScriptsSnapshot = await getDocs(collection(db, "scripts"));
          
          const sharedScripts = allScriptsSnapshot.docs
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title || "Untitled",
                author: data.author || "Unknown",
                scenes: Array.isArray(data.scenes) ? data.scenes : [],
                userId: data.userId || "unknown",
                visibility: data.visibility || "public",
                createdAt: data.createdAt || Timestamp.now(),
                updatedAt: data.updatedAt || Timestamp.now(),
                lastEditedBy: data.lastEditedBy || "unknown",
                sharedWith: data.sharedWith || {}
              };
            })
            .filter(script => 
              script.sharedWith && 
              script.sharedWith[user.email] && 
              script.userId !== user.uid
            );
          
          console.log("Scripts shared with user:", sharedScripts.length);
          
          scripts = [...scripts, ...sharedScripts];
        } catch (error) {
          console.error("Error fetching shared scripts:", error);
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
      if (!scriptId) {
        console.error("Invalid script ID:", scriptId);
        throw new Error("Invalid script ID provided");
      }
      
      console.log(`Fetching script with ID: ${scriptId}`);
      const scriptDoc = await getDoc(doc(db, "scripts", scriptId));
      
      if (!scriptDoc.exists()) {
        console.error(`Script not found with ID: ${scriptId}`);
        return null;
      }
      
      const data = scriptDoc.data();
      console.log(`Script data retrieved for ID ${scriptId}:`, data);
      
      if (!data) {
        console.error("No data found in script document");
        throw new Error("Script document exists but contains no data");
      }
      
      const scriptOwnerId = data.userId;
      const isOwner = user.uid === scriptOwnerId;
      const isShared = data.sharedWith && 
                       user.email && 
                       data.sharedWith[user.email];
                       
      console.log(`Script access check: isOwner=${isOwner}, isShared=${!!isShared}`);
      
      if (!isOwner && !isShared) {
        console.error(`User ${user.uid} doesn't have access to script ${scriptId}`);
        throw new Error("You don't have permission to access this script");
      }
      
      return data;
    } catch (error) {
      console.error("Error getting script:", error);
      throw error;
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

  const shareScript = async (
    scriptId: string, 
    email: string, 
    accessLevel: ScriptAccessLevel,
    password?: string
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const scriptDoc = await getDoc(doc(db, "scripts", scriptId));
      
      if (!scriptDoc.exists()) {
        throw new Error("Script not found");
      }
      
      const scriptData = scriptDoc.data();
      
      if (scriptData.userId !== user.uid) {
        throw new Error("You don't have permission to share this script");
      }
      
      const sharedWith = scriptData.sharedWith || {};
      sharedWith[email] = {
        accessLevel,
        sharedAt: Timestamp.now()
      };
      
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

  const removeScriptSharing = async (scriptId: string, email: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const scriptDoc = await getDoc(doc(db, "scripts", scriptId));
      
      if (!scriptDoc.exists()) {
        throw new Error("Script not found");
      }
      
      const scriptData = scriptDoc.data();
      
      if (scriptData.userId !== user.uid) {
        throw new Error("You don't have permission to modify sharing for this script");
      }
      
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

  const getScriptSharing = async (scriptId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const scriptDoc = await getDoc(doc(db, "scripts", scriptId));
      
      if (!scriptDoc.exists()) {
        throw new Error("Script not found");
      }
      
      const scriptData = scriptDoc.data();
      
      if (scriptData.userId !== user.uid) {
        throw new Error("You don't have permission to view sharing for this script");
      }
      
      const sharedWith = scriptData.sharedWith || {};
      
      return Object.keys(sharedWith).map(email => ({
        email,
        accessLevel: sharedWith[email].accessLevel,
        sharedAt: sharedWith[email].sharedAt,
        password: sharedWith[email].password
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
    getScriptSharing,
    getScriptVersions,
    getScriptVersion,
    saveScriptVersion,
    getAllScripts
  };
};
