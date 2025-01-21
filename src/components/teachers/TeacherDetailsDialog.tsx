import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Teacher } from "./types";
import { Separator } from "@/components/ui/separator";

interface TeacherDetailsDialogProps {
  teacher: Teacher | null;
  onClose: () => void;
}

export function TeacherDetailsDialog({ teacher, onClose }: TeacherDetailsDialogProps) {
  return (
    <Dialog open={!!teacher} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] animate-fadeIn bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary-dark">Teacher Details</DialogTitle>
        </DialogHeader>
        {teacher && (
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-center">
              <Avatar className="h-24 w-24 ring-2 ring-primary/20">
                <AvatarImage src={teacher.profile_picture_url || ''} alt={teacher.name} />
                <AvatarFallback className="bg-primary/10 text-primary-dark">
                  {teacher.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
                <Separator className="bg-primary/10" />
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Name:</span>
                  <span className="col-span-3">{teacher.name}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Gender:</span>
                  <span className="col-span-3 capitalize">{teacher.gender}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Studies:</span>
                  <span className="col-span-3">{teacher.studies}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
                <Separator className="bg-primary/10" />
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Dorm:</span>
                  <span className="col-span-3">{teacher.dorm_room || '-'}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Address:</span>
                  <span className="col-span-3">{teacher.address}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Phone:</span>
                  <span className="col-span-3">{teacher.phone_number}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}