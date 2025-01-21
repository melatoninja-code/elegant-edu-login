import { Edit, Trash, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeacherActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  teacher: {
    id: string;
    email?: string;
    auth_id?: string | null;
  };
  isAdmin: boolean;
}

export function TeacherActions({ onEdit, onDelete, teacher, isAdmin }: TeacherActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    try {
      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account");

      // Update teacher record with auth_id
      const { error: updateError } = await supabase
        .from("teachers")
        .update({ auth_id: authData.user.id })
        .eq("id", teacher.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Account created successfully. User will receive an email to verify their account.",
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 border-primary/20 hover:bg-primary/5 transition-colors"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 border-primary/20 hover:bg-primary/5 hover:text-red-500 transition-colors"
        >
          <Trash className="h-4 w-4" />
        </Button>
        {isAdmin && !teacher.auth_id && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            className="h-8 w-8 border-primary/20 hover:bg-primary/5 hover:text-green-500 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
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
    </>
  );
}