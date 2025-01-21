import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Teacher } from "./types";
import { Mail, Phone, MapPin, School, Home, User2 } from "lucide-react";

interface TeacherDetailsDialogProps {
  teacher: Teacher | null;
  onClose: () => void;
  isAdmin?: boolean;
}

export function TeacherDetailsDialog({ teacher, onClose, isAdmin }: TeacherDetailsDialogProps) {
  if (!teacher) return null;

  const initials = teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Dialog open={!!teacher} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Teacher Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={teacher.profile_picture_url || ""} alt={teacher.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{teacher.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {teacher.gender}
                </Badge>
                {teacher.dorm_room && (
                  <Badge variant="outline">Room {teacher.dorm_room}</Badge>
                )}
              </div>
            </div>
          </div>

          {isAdmin && teacher.account_email && teacher.account_password && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2 border border-border/50">
              <h3 className="font-medium text-sm text-muted-foreground">Account Credentials</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{teacher.account_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Password:</span>
                  <span>{teacher.account_password}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{teacher.email || "No email set"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{teacher.phone_number}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{teacher.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-muted-foreground" />
              <span>{teacher.studies}</span>
            </div>
            {teacher.dorm_room && (
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span>Room {teacher.dorm_room}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{teacher.gender}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}