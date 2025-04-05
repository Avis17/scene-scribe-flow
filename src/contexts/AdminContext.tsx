
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

// Create a default context value to avoid the "must be used within a Provider" error
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

// Fix: Make sure this matches the exact string of the admin email with correct casing
export const ADMIN_EMAIL = "sivasubramanian1617@gmail.com";

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    console.error("useAdmin must be used within an AdminProvider");
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

  // Check if current user is admin - improved with better logging and handling
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        setAdminCheckComplete(true);
        return;
      }

      try {
        console.log("Starting admin status check for:", user.email);
        console.log("Admin email constant:", ADMIN_EMAIL);
        
        // IMPORTANT: Force email string comparison to lowercase for both
        const userEmailLower = user.email ? user.email.toLowerCase() : '';
        const adminEmailLower = ADMIN_EMAIL.toLowerCase();
        
        console.log("User email lowercase:", userEmailLower);
        console.log("Admin email lowercase:", adminEmailLower);
        
        let isUserAdmin = false;
        
        // Check if user email matches admin email (using lowercase comparison)
        if (userEmailLower === adminEmailLower) {
          console.log("✅ Email matches admin email exactly, granting admin access");
          isUserAdmin = true;
          
          try {
            // Try to create admin record in database if it doesn't exist,
            // but don't block access if this fails due to permissions
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
                console.log("Created admin record in database");
              } catch (dbError) {
                // Just log this error but don't let it affect admin access
                console.warn("Could not create admin record in database:", dbError);
                console.log("Administrator access granted based on email match only");
              }
            }
          } catch (error) {
            // Just log this error but don't let it affect admin access
            console.warn("Error checking database for admin record:", error);
            console.log("Administrator access granted based on email match only");
          }
        } else {
          // Try to check if user has admin permission in database
          try {
            console.log("Checking for admin permission in database for uid:", user.uid);
            const userRef = doc(db, "permissions", user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists() && userDoc.data().permissions?.includes("admin")) {
              console.log("✅ User has admin permission in database");
              isUserAdmin = true;
            } else {
              console.log("❌ User does not have admin permission");
              isUserAdmin = false;
            }
          } catch (error) {
            console.error("Error checking database permissions:", error);
            isUserAdmin = false;
          }
        }
        
        // Only update state once with final decision to prevent flickering
        console.log("Final admin status determination:", isUserAdmin);
        setIsAdmin(isUserAdmin);
        
      } catch (error) {
        console.error("Error checking admin status:", error);
        
        // FALLBACK: If there was an error but email matches admin email exactly,
        // still grant admin access
        if (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          console.log("⚠️ Error occurred, but email matches admin - granting access");
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } finally {
        setLoading(false);
        setAdminCheckComplete(true);
      }
    };
    
    // Reset states when user changes
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

  // Fetch all users with permissions - with better error handling
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
      // Return an empty array but don't crash
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Update user permissions - with better error handling
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
      // Show user-friendly error
      throw new Error("Could not update permissions. You may not have sufficient access rights.");
    } finally {
      setLoading(false);
    }
  };

  // Remove user from permissions - with better error handling
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
      // Show user-friendly error
      throw new Error("Could not remove user. You may not have sufficient access rights.");
    } finally {
      setLoading(false);
    }
  };

  // Add new user with permissions - with better error handling
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
      // Show user-friendly error based on error type
      if (error instanceof Error && error.message === "User already has permissions") {
        throw error;
      } else {
        throw new Error("Could not add user. You may not have sufficient access rights.");
      }
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    isAdmin,
    loading,
    users,
    fetchUsers,
    updateUserPermissions,
    removeUser,
    addUser
  };

  console.log("AdminProvider rendering with isAdmin:", isAdmin, "adminCheckComplete:", adminCheckComplete);
  
  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
