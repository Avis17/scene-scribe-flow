
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useFirebase } from "./FirebaseContext";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";

type UserPermission = "read" | "write" | "delete" | "admin";

export interface UserWithPermissions {
  uid: string;
  email: string;
  displayName: string | null;
  permissions: UserPermission[];
  lastUpdated?: string;
}

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  users: UserWithPermissions[];
  fetchUsers: () => Promise<void>;
  updateUserPermissions: (uid: string, permissions: UserPermission[]) => Promise<void>;
  removeUser: (uid: string) => Promise<void>;
  addUser: (email: string, permissions: UserPermission[]) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const ADMIN_EMAIL = "sivasubramanian1617@gmail.com";

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user, db } = useFirebase();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserWithPermissions[]>([]);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user email matches admin email
        if (user.email === ADMIN_EMAIL) {
          setIsAdmin(true);
          
          // Create admin record in database if it doesn't exist
          const adminRef = doc(db, "permissions", user.uid);
          const adminDoc = await getDoc(adminRef);
          
          if (!adminDoc.exists()) {
            await setDoc(adminRef, {
              email: user.email,
              displayName: user.displayName,
              permissions: ["read", "write", "delete", "admin"],
              lastUpdated: new Date().toISOString()
            });
          }
        } else {
          // Check if user has admin permission
          const userRef = doc(db, "permissions", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists() && userDoc.data().permissions?.includes("admin")) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user, db]);

  // Fetch all users with permissions
  const fetchUsers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const permissionsRef = collection(db, "permissions");
      const querySnapshot = await getDocs(permissionsRef);
      
      const usersData: UserWithPermissions[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as Omit<UserWithPermissions, 'uid'>;
        usersData.push({
          uid: doc.id,
          email: userData.email,
          displayName: userData.displayName,
          permissions: userData.permissions || [],
          lastUpdated: userData.lastUpdated
        });
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update user permissions
  const updateUserPermissions = async (uid: string, permissions: UserPermission[]) => {
    try {
      setLoading(true);
      const userRef = doc(db, "permissions", uid);
      await updateDoc(userRef, {
        permissions,
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, permissions } : user
      ));
      
      return;
    } catch (error) {
      console.error("Error updating user permissions:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove user from permissions
  const removeUser = async (uid: string) => {
    try {
      setLoading(true);
      const userRef = doc(db, "permissions", uid);
      await deleteDoc(userRef);
      
      // Update local state
      setUsers(prev => prev.filter(user => user.uid !== uid));
      
      return;
    } catch (error) {
      console.error("Error removing user:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add new user with permissions
  const addUser = async (email: string, permissions: UserPermission[]) => {
    try {
      setLoading(true);
      
      // Check if user already exists in permissions
      const permissionsRef = collection(db, "permissions");
      const q = query(permissionsRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error("User already has permissions");
      }
      
      // Find user in Firebase Auth
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);
      
      let uid: string;
      let displayName: string | null = null;
      
      if (userSnapshot.empty) {
        // User doesn't exist in Firebase yet, generate a placeholder ID
        uid = `pending_${Date.now()}`;
      } else {
        // Get user ID from existing user
        uid = userSnapshot.docs[0].id;
        displayName = userSnapshot.docs[0].data().displayName || null;
      }
      
      // Add user to permissions collection
      const permissionRef = doc(db, "permissions", uid);
      await setDoc(permissionRef, {
        email,
        displayName,
        permissions,
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state
      setUsers(prev => [...prev, {
        uid,
        email,
        displayName,
        permissions,
        lastUpdated: new Date().toISOString()
      }]);
      
      return;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        loading,
        users,
        fetchUsers,
        updateUserPermissions,
        removeUser,
        addUser
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
