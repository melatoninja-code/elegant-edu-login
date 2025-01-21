import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Teacher } from "./types";
import { Separator } from "@/components/ui/separator";

interface TeacherDetailsDialogProps {
  teacher: Teacher | null;
  onClose: () => void;
}

export function TeacherDetailsDialog({ teacher, onClose }: TeacherDetailsDialogProps) {
  if (!teacher) return null;

  return (
    <Card className="w-full animate-fadeIn">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-semibold text-primary-dark">Teacher Details</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 py-6">
          <div className="flex items-center justify-center">
            <Avatar className="h-32 w-32 ring-4 ring-primary/20">
              <AvatarImage src={teacher.profile_picture_url || ''} alt={teacher.name} />
              <AvatarFallback className="bg-primary/10 text-primary-dark text-2xl">
                {teacher.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-base text-muted-foreground">Personal Information</h4>
              <Separator className="bg-primary/10" />
              <div className="grid grid-cols-4 items-center gap-6">
                <span className="font-medium">Name:</span>
                <span className="col-span-3">{teacher.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-6">
                <span className="font-medium">Gender:</span>
                <span className="col-span-3 capitalize">{teacher.gender}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-6">
                <span className="font-medium">Studies:</span>
                <span className="col-span-3">{teacher.studies}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-base text-muted-foreground">Contact Information</h4>
              <Separator className="bg-primary/10" />
              <div className="grid grid-cols-4 items-center gap-6">
                <span className="font-medium">Dorm:</span>
                <span className="col-span-3">{teacher.dorm_room || '-'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-6">
                <span className="font-medium">Address:</span>
                <span className="col-span-3">{teacher.address}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-6">
                <span className="font-medium">Phone:</span>
                <span className="col-span-3">{teacher.phone_number}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}