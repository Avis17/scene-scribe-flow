
import React, { useState, useEffect } from "react";
import { useAdmin, UserWithPermissions } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Trash2, 
  Save, 
  UserPlus, 
  User, 
  FileText, 
  Pencil,
  FileLock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useScriptService, ScriptVisibility } from "@/services/ScriptService";

interface ScriptData {
  id: string;
  title: string;
  author: string;
  visibility: ScriptVisibility;
  userId: string;
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
}

const Admin: React.FC = () => {
  const { isAdmin, loading, users, fetchUsers, updateUserPermissions, removeUser, addUser } = useAdmin();
  const { toast } = useToast();
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPermissions, setNewUserPermissions] = useState<{
    read: boolean;
    write: boolean;
    delete: boolean;
    admin: boolean;
  }>({
    read: true,
    write: false,
    delete: false,
    admin: false,
  });
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [scripts, setScripts] = useState<ScriptData[]>([]);
  const [protectedScripts, setProtectedScripts] = useState<ScriptData[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const scriptService = useScriptService();
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    // Only fetch data once to prevent infinite loop
    if (!dataFetched && !loading && isAdmin) {
      fetchUsers();
      fetchScripts();
      setDataFetched(true);
    }
  }, [isAdmin, loading, dataFetched]);

  const fetchScripts = async () => {
    try {
      setLoadingScripts(true);
      const allScripts = await scriptService.getUserScripts(true);
      
      const regularScripts = allScripts.filter((script) => script.visibility !== "protected");
      const protectedScriptsData = allScripts.filter((script) => script.visibility === "protected");
      
      setScripts(regularScripts);
      setProtectedScripts(protectedScriptsData);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      toast({
        title: "Error",
        description: "Failed to load scripts",
        variant: "destructive",
      });
    } finally {
      setLoadingScripts(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email",
        variant: "destructive",
      });
      return;
    }

    try {
      const permissions = [];
      if (newUserPermissions.read) permissions.push("read");
      if (newUserPermissions.write) permissions.push("write");
      if (newUserPermissions.delete) permissions.push("delete");
      if (newUserPermissions.admin) permissions.push("admin");

      await addUser(newUserEmail, permissions);
      
      setNewUserEmail("");
      setNewUserPermissions({
        read: true,
        write: false,
        delete: false,
        admin: false,
      });
      
      toast({
        title: "Success",
        description: "User added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: UserWithPermissions) => {
    setEditingUser(user.uid);
    setUserPermissions({
      read: user.permissions.includes("read"),
      write: user.permissions.includes("write"),
      delete: user.permissions.includes("delete"),
      admin: user.permissions.includes("admin"),
    });
  };

  const handleSavePermissions = async (uid: string) => {
    try {
      const permissions = [];
      if (userPermissions.read) permissions.push("read");
      if (userPermissions.write) permissions.push("write");
      if (userPermissions.delete) permissions.push("delete");
      if (userPermissions.admin) permissions.push("admin");

      await updateUserPermissions(uid, permissions);
      
      setEditingUser(null);
      
      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      await removeUser(uid);
      
      toast({
        title: "Success",
        description: "User removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateScriptVisibility = async (scriptId: string, visibility: ScriptVisibility) => {
    try {
      await scriptService.updateScriptVisibility(scriptId, visibility);
      await fetchScripts(); // Refresh the script lists
      
      toast({
        title: "Success",
        description: `Script marked as ${visibility} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update script visibility",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isAdmin) {
    return null; // Should be handled by AdminGuard
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto p-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="scripts">Script Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add New User
                </CardTitle>
                <CardDescription>Grant permissions to new users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                    <Input
                      placeholder="Email address"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="new-user-read"
                        checked={newUserPermissions.read}
                        onCheckedChange={(checked) => 
                          setNewUserPermissions({...newUserPermissions, read: !!checked})
                        }
                      />
                      <label htmlFor="new-user-read">Read</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="new-user-write"
                        checked={newUserPermissions.write}
                        onCheckedChange={(checked) => 
                          setNewUserPermissions({...newUserPermissions, write: !!checked})
                        }
                      />
                      <label htmlFor="new-user-write">Write</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="new-user-delete"
                        checked={newUserPermissions.delete}
                        onCheckedChange={(checked) => 
                          setNewUserPermissions({...newUserPermissions, delete: !!checked})
                        }
                      />
                      <label htmlFor="new-user-delete">Delete</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="new-user-admin"
                        checked={newUserPermissions.admin}
                        onCheckedChange={(checked) => 
                          setNewUserPermissions({...newUserPermissions, admin: !!checked})
                        }
                      />
                      <label htmlFor="new-user-admin">Admin</label>
                    </div>
                  </div>
                  <Button onClick={handleAddUser}>Add User</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  User Permissions
                </CardTitle>
                <CardDescription>Manage user access and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>List of users with access permissions</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Read</TableHead>
                        <TableHead>Write</TableHead>
                        <TableHead>Delete</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.uid}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.displayName || "-"}</TableCell>
                          {editingUser === user.uid ? (
                            <>
                              <TableCell>
                                <Checkbox 
                                  checked={userPermissions.read}
                                  onCheckedChange={(checked) => 
                                    setUserPermissions({...userPermissions, read: !!checked})
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox 
                                  checked={userPermissions.write}
                                  onCheckedChange={(checked) => 
                                    setUserPermissions({...userPermissions, write: !!checked})
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox 
                                  checked={userPermissions.delete}
                                  onCheckedChange={(checked) => 
                                    setUserPermissions({...userPermissions, delete: !!checked})
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox 
                                  checked={userPermissions.admin}
                                  onCheckedChange={(checked) => 
                                    setUserPermissions({...userPermissions, admin: !!checked})
                                  }
                                />
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{user.permissions.includes("read") ? "✓" : "-"}</TableCell>
                              <TableCell>{user.permissions.includes("write") ? "✓" : "-"}</TableCell>
                              <TableCell>{user.permissions.includes("delete") ? "✓" : "-"}</TableCell>
                              <TableCell>{user.permissions.includes("admin") ? "✓" : "-"}</TableCell>
                            </>
                          )}
                          <TableCell>{user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : "-"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {editingUser === user.uid ? (
                                <Button size="sm" variant="outline" onClick={() => handleSavePermissions(user.uid)}>
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              )}
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.uid)}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scripts">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileLock className="h-5 w-5 mr-2" />
                    Protected Scripts
                  </CardTitle>
                  <CardDescription>Scripts only visible to administrators</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingScripts ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : protectedScripts.length > 0 ? (
                    <Table>
                      <TableCaption>Protected scripts visible only to admins</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {protectedScripts.map((script) => (
                          <TableRow key={script.id}>
                            <TableCell>{script.title}</TableCell>
                            <TableCell>{script.author}</TableCell>
                            <TableCell>{formatDate(script.createdAt.toDate())}</TableCell>
                            <TableCell>{formatDate(script.updatedAt.toDate())}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateScriptVisibility(script.id, "public")}
                              >
                                Make Public
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No protected scripts found
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Public Scripts
                  </CardTitle>
                  <CardDescription>Mark scripts as protected to restrict access</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingScripts ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : scripts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scripts.map((script) => (
                          <TableRow key={script.id}>
                            <TableCell>{script.title}</TableCell>
                            <TableCell>{script.author}</TableCell>
                            <TableCell>{formatDate(script.createdAt.toDate())}</TableCell>
                            <TableCell>{formatDate(script.updatedAt.toDate())}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateScriptVisibility(script.id, "protected")}
                              >
                                Make Protected
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No public scripts found
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
