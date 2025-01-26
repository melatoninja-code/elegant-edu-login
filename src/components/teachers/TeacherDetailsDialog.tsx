import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Teacher } from "./types";
import { Mail, Phone, MapPin, School, Home, User2 } from "lucide-react";
import { TeacherTags } from "./TeacherTags";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TeacherDetailsDialogProps {
  teacher: Teacher | null;
  onClose: () => void;
  isAdmin?: boolean;
}

export function TeacherDetailsDialog({ teacher, onClose, isAdmin }: TeacherDetailsDialogProps) {
  const { toast } = useToast();
  
  if (!teacher) return null;

  const initials = teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSetPassword = async () => {
    if (!teacher.auth_id) {
      toast({
        title: "Error",
        description: "This teacher does not have an account linked.",
        variant: "destructive",
      });
      return;
    }

    const newPassword = prompt("Enter a new password for this teacher:");
    if (!newPassword) return;

    const { error } = await supabase.auth.admin.updateUserById(teacher.auth_id, {
      password: newPassword,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
    }
  };

  return (
    <Dialog open={!!teacher} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Teacher Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          {/* Header Section with Avatar and Basic Info */}
          <div className="flex items-start gap-6 bg-neutral-light/50 p-6 rounded-lg">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={teacher.profile_picture_url || ""} alt={teacher.name} />
              <AvatarFallback className="text-xl bg-primary-light text-primary-dark">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary-dark">{teacher.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize bg-white">
                  {teacher.gender}
                </Badge>
                {teacher.dorm_room && (
                  <Badge variant="outline" className="bg-white">
                    Room {teacher.dorm_room}
                  </Badge>
                )}
              </div>
              {teacher.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{teacher.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid gap-6">
            <h3 className="text-lg font-semibold text-primary-dark">Contact Information</h3>
            <div className="grid gap-4 bg-white p-4 rounded-lg border border-border/10">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span>{teacher.phone_number}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{teacher.address}</span>
              </div>
              {teacher.dorm_room && (
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-primary" />
                  <span>Room {teacher.dorm_room}</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid gap-6">
            <h3 className="text-lg font-semibold text-primary-dark">Academic Information</h3>
            <div className="grid gap-4 bg-white p-4 rounded-lg border border-border/10">
              <div className="flex items-center gap-3">
                <School className="h-5 w-5 text-primary" />
                <span>{teacher.studies}</span>
              </div>
              <div className="flex items-center gap-3">
                <User2 className="h-5 w-5 text-primary" />
                <span className="capitalize">{teacher.gender}</span>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-dark">Specializations & Skills</h3>
            <TeacherTags teacherId={teacher.id} isAdmin={isAdmin} />
          </div>

          {/* Admin Actions */}
          {isAdmin && teacher.auth_id && (
            <div className="flex justify-end pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleSetPassword}
                className="bg-white hover:bg-primary-lighter text-primary-dark"
              >
                Set Password
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}