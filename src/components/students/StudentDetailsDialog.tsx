import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/types/student";
import { format } from "date-fns";
import { X, Mail, Phone, MapPin, School, Home, User2, Users } from "lucide-react";

interface StudentDetailsDialogProps {
  student: Student | null;
  onClose: () => void;
}

export function StudentDetailsDialog({ student, onClose }: StudentDetailsDialogProps) {
  if (!student) return null;

  const getStatusColor = (status: Student["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "inactive":
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
      case "graduated":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "suspended":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <Dialog open={!!student} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle>Student Details</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{student.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {student.gender}
                </Badge>
                <Badge variant="outline">Grade {student.grade_level}</Badge>
                <Badge
                  variant="secondary"
                  className={`capitalize ${getStatusColor(student.status)}`}
                >
                  {student.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-muted-foreground" />
              <span>Student ID: {student.student_id}</span>
            </div>
            {student.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student.email}</span>
              </div>
            )}
            {student.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone_number}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{student.address}</span>
            </div>
            {student.dorm_room && (
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span>Room {student.dorm_room}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-muted-foreground" />
              <span>Date of Birth: {format(new Date(student.date_of_birth), "PPP")}</span>
            </div>
            {student.parent_name && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Parent: {student.parent_name}</span>
                {student.parent_phone && (
                  <span className="text-muted-foreground">({student.parent_phone})</span>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}