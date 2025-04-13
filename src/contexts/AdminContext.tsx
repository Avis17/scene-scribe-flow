
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
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

const defaultContextValue: AdminContextType = {
  isAdmin: false,
  loading: true,
  users: [],
  fetchUsers: async () => {},
  updateUserPermissions: async () => {},
  removeUser: async () => {},
  addUser: async () => {}
};

const AdminContext = createContext<AdminContextType>(defaultContextValue);

export const ADMIN_EMAIL = "sivasubramanian1617@gmail.com";

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    return defaultContextValue;
  }
  return context;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user, db } = useFirebase();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [adminCheckComplete, setAdminCheckComplete] = useState<boolean>(false);
  
  const adminCheckInProgress = useRef(false);

  useEffect(() => {
    if (adminCheckInProgress.current) {
      return;
    }
    
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        setAdminCheckComplete(true);
        return;
      }

      try {
        adminCheckInProgress.current = true;
        
        const userEmailLower = user.email ? user.email.toLowerCase() : '';
        const adminEmailLower = ADMIN_EMAIL.toLowerCase();
        
        let isUserAdmin = false;
        
        if (userEmailLower === adminEmailLower) {
          isUserAdmin = true;
          
          try {
            const adminRef = doc(db, "permissions", user.uid);
            const adminDoc = await getDoc(adminRef);
            
            if (!adminDoc.exists()) {
              try {
                await setDoc(adminRef, {
                  email: user.email,
                  displayName: user.displayName,
                  permissions: ["read", "write", "delete", "admin"],
                  lastUpdated: new Date().toISOString()
                });
              } catch (dbError) {
                // Error handling without console.log
              }
            }
          } catch (error) {
            // Error handling without console.log
          }
        } else {
          try {
            const userRef = doc(db, "permissions", user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists() && userDoc.data().permissions?.includes("admin")) {
              isUserAdmin = true;
            } else {
              isUserAdmin = false;
            }
          } catch (error) {
            isUserAdmin = false;
          }
        }
        
        setIsAdmin(isUserAdmin);
      } catch (error) {
        if (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } finally {
        setLoading(false);
        setAdminCheckComplete(true);
        adminCheckInProgress.current = false;
      }
    };
    
    if (user) {
      setLoading(true);
      setAdminCheckComplete(false);
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setLoading(false);
      setAdminCheckComplete(true);
    }
  }, [user, db]);

  const fetchUsers = useCallback(async () => {
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
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user, db]);

  const updateUserPermissions = useCallback(async (uid: string, permissions: UserPermission[]) => {
    try {
      setLoading(true);
      const userRef = doc(db, "permissions", uid);
      await updateDoc(userRef, {
        permissions,
        lastUpdated: new Date().toISOString()
      });
      
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, permissions } : user
      ));
      
      return;
    } catch (error) {
      throw new Error("Could not update permissions. You may not have sufficient access rights.");
    } finally {
      setLoading(false);
    }
  }, [db]);

  const removeUser = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      const userRef = doc(db, "permissions", uid);
      await deleteDoc(userRef);
      
      setUsers(prev => prev.filter(user => user.uid !== uid));
      
      return;
    } catch (error) {
      throw new Error("Could not remove user. You may not have sufficient access rights.");
    } finally {
      setLoading(false);
    }
  }, [db]);

  const addUser = useCallback(async (email: string, permissions: UserPermission[]) => {
    try {
      setLoading(true);
      
      const permissionsRef = collection(db, "permissions");
      const q = query(permissionsRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error("User already has permissions");
      }
      
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);
      
      let uid: string;
      let displayName: string | null = null;
      
      if (userSnapshot.empty) {
        uid = `pending_${Date.now()}`;
      } else {
        uid = userSnapshot.docs[0].id;
        displayName = userSnapshot.docs[0].data().displayName || null;
      }
      
      const permissionRef = doc(db, "permissions", uid);
      await setDoc(permissionRef, {
        email,
        displayName,
        permissions,
        lastUpdated: new Date().toISOString()
      });
      
      setUsers(prev => [...prev, {
        uid,
        email,
        displayName,
        permissions,
        lastUpdated: new Date().toISOString()
      }]);
      
      return;
    } catch (error) {
      if (error instanceof Error && error.message === "User already has permissions") {
        throw error;
      } else {
        throw new Error("Could not add user. You may not have sufficient access rights.");
      }
    } finally {
      setLoading(false);
    }
  }, [db]);

  const contextValue = {
    isAdmin,
    loading,
    users,
    fetchUsers,
    updateUserPermissions,
    removeUser,
    addUser
  };
  
  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
