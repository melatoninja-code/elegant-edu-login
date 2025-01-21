import { Edit, Trash, UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeacherActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onAccountCreated?: (email: string, password: string) => void;
  teacher: {
    id: string;
    email?: string;
    auth_id?: string | null;
    name: string;
  };
  isAdmin: boolean;
}

export function TeacherActions({ onEdit, onDelete, onAccountCreated, teacher, isAdmin }: TeacherActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [email, setEmail] = useState(teacher.email || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAccount = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    let adminSession = null;

    try {
      // Store current admin session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) throw new Error("No admin session found");
      adminSession = currentSession;

      // Create teacher account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'teacher'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account");

      // Update teacher record with auth_id
      const { error: updateError } = await supabase
        .from("teachers")
        .update({ auth_id: authData.user.id, email })
        .eq("id", teacher.id);

      if (updateError) throw updateError;

      // Explicitly restore admin session
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });

      if (onAccountCreated) {
        onAccountCreated(email, password);
      }
      
      setIsDialogOpen(false);
      setIsSuccessDialogOpen(true);
    } catch (error: any) {
      console.error("Error creating teacher account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      // Always attempt to restore admin session in finally block
      if (adminSession) {
        try {
          await supabase.auth.setSession({
            access_token: adminSession.access_token,
            refresh_token: adminSession.refresh_token,
          });
        } catch (sessionError) {
          console.error("Error restoring admin session:", sessionError);
          toast({
            title: "Warning",
            description: "Your admin session may have expired. Please refresh the page.",
            variant: "destructive",
          });
        }
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 min-w-8 border-primary/20 hover:bg-primary/5 transition-colors"
          title="Edit"
        >
          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="h-8 w-8 min-w-8 border-primary/20 hover:bg-primary/5 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        {isAdmin && !teacher.auth_id && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            className="h-8 w-8 min-w-8 border-primary/20 hover:bg-primary/5 hover:text-green-500 transition-colors"
            title="Create Account"
          >
            <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Account for Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.com"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAccount}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <DialogTitle>Account Created Successfully!</DialogTitle>
            <p className="text-muted-foreground">
              An account has been created for {teacher.name}. They will receive an email to verify their account.
            </p>
            <Button onClick={() => setIsSuccessDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {teacher.name}'s record
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setIsDeleteDialogOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
