
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Share2 } from "lucide-react";
import { useScriptService, ScriptAccessLevel } from "@/services/ScriptService";

interface ShareScriptDialogProps {
  scriptId: string;
  scriptTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SharedUser {
  email: string;
  accessLevel: ScriptAccessLevel;
  sharedAt: { toDate: () => Date };
}

const ShareScriptDialog: React.FC<ShareScriptDialogProps> = ({
  scriptId,
  scriptTitle,
  isOpen,
  onClose
}) => {
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<ScriptAccessLevel>("view");
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingShares, setLoadingShares] = useState(false);
  
  const scriptService = useScriptService();
  const { toast } = useToast();
  
  // Load existing shares when dialog opens
  useEffect(() => {
    if (isOpen && scriptId) {
      fetchSharedUsers();
    }
  }, [isOpen, scriptId]);
  
  const fetchSharedUsers = async () => {
    if (!scriptId) return;
    
    try {
      setLoadingShares(true);
      const shares = await scriptService.getScriptSharing(scriptId);
      setSharedUsers(shares);
    } catch (error) {
      console.error("Error fetching shared users:", error);
      toast({
        title: "Error",
        description: "Failed to load shared users",
        variant: "destructive",
      });
    } finally {
      setLoadingShares(false);
    }
  };
  
  const handleShareScript = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      await scriptService.shareScript(scriptId, email.trim(), accessLevel);
      
      toast({
        title: "Success",
        description: `Script shared with ${email}`,
      });
      
      // Refresh shared users list
      await fetchSharedUsers();
      
      // Clear form
      setEmail("");
      setAccessLevel("view");
    } catch (error) {
      console.error("Error sharing script:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to share script",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveSharing = async (email: string) => {
    try {
      await scriptService.removeScriptSharing(scriptId, email);
      
      toast({
        title: "Success",
        description: `Sharing removed for ${email}`,
      });
      
      // Refresh shared users list
      await fetchSharedUsers();
    } catch (error) {
      console.error("Error removing sharing:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove sharing",
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share Script
          </DialogTitle>
          <DialogDescription>
            Share "{scriptTitle}" with other registered users
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input 
                  id="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="user@example.com"
                  className="flex-1"
                />
                <Button 
                  onClick={handleShareScript} 
                  disabled={loading}
                  type="button"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Access Level</Label>
              <RadioGroup value={accessLevel} onValueChange={(value) => setAccessLevel(value as ScriptAccessLevel)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view" id="view" />
                  <Label htmlFor="view">View only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="edit" />
                  <Label htmlFor="edit">Edit (can modify and delete)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Shared with
            </h3>
            
            {loadingShares ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
              </div>
            ) : sharedUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Shared At</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedUsers.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.accessLevel === "view" ? "View only" : "Edit"}
                      </TableCell>
                      <TableCell>{formatDate(user.sharedAt.toDate())}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSharing(user.email)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
                This script is not shared with anyone yet.
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareScriptDialog;
