import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/types/student";
import { format } from "date-fns";
import { 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Home, 
  CalendarDays, 
  Users2,
  UserRound,
  BookOpen,
  Heart,
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StudentDocuments } from "./StudentDocuments";

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Student Profile</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-6 py-4 px-1">
          {/* Header Section with Avatar and Basic Info */}
          <div className="flex items-start gap-6 bg-neutral-light/50 p-6 rounded-lg">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={student.profile_picture_url || ""} alt={student.name} />
              <AvatarFallback className="text-xl bg-primary-light text-primary-dark">
                {student.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary-dark">{student.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize bg-white">
                  {student.gender}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Grade {student.grade_level}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`capitalize ${getStatusColor(student.status)}`}
                >
                  {student.status}
                </Badge>
              </div>
              {student.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{student.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid gap-4 p-4 rounded-lg bg-neutral-light">
            <div className="flex items-center gap-2 text-primary">
              <GraduationCap className="h-5 w-5 shrink-0" />
              <span className="font-semibold">Academic Information</span>
            </div>
            <div className="grid gap-3 pl-7">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="break-all">Student ID: {student.student_id}</span>
              </div>
              {student.class_section && (
                <div className="flex items-center gap-2">
                  <Users2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="break-all">Class Section: {student.class_section}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4 p-4 rounded-lg bg-neutral-light">
            <div className="flex items-center gap-2 text-primary">
              <Phone className="h-5 w-5 shrink-0" />
              <span className="font-semibold">Contact Information</span>
            </div>
            <div className="grid gap-3 pl-7">
              {student.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="break-all">{student.email}</span>
                </div>
              )}
              {student.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{student.phone_number}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
                <span className="break-words">{student.address}</span>
              </div>
              {student.dorm_room && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>Room {student.dorm_room}</span>
                </div>
              )}
            </div>
          </div>

          {/* Personal Details */}
          <div className="grid gap-4 p-4 rounded-lg bg-neutral-light">
            <div className="flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5 shrink-0" />
              <span className="font-semibold">Personal Details</span>
            </div>
            <div className="grid gap-3 pl-7">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Date of Birth: {format(new Date(student.date_of_birth), "dd/MM/yyyy")}</span>
              </div>
              {student.parent_name && (
                <div className="flex items-center gap-2">
                  <Users2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="break-all">Parent: {student.parent_name}</span>
                  {student.parent_phone && (
                    <span className="text-muted-foreground">({student.parent_phone})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="grid gap-4 p-4 rounded-lg bg-neutral-light">
            <div className="flex items-center gap-2 text-primary">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-semibold">Emergency Contacts</span>
            </div>
            <div className="grid gap-3 pl-7">
              {(student.emergency_contact_1_name || student.emergency_contact_1_phone) && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">
                      {student.emergency_contact_1_name}
                    </span>
                  </div>
                  {student.emergency_contact_1_phone && (
                    <div className="flex items-center gap-2 pl-6">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {student.emergency_contact_1_phone}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {(student.emergency_contact_2_name || student.emergency_contact_2_phone) && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">
                      {student.emergency_contact_2_name}
                    </span>
                  </div>
                  {student.emergency_contact_2_phone && (
                    <div className="flex items-center gap-2 pl-6">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {student.emergency_contact_2_phone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Documents Section */}
          {student && <StudentDocuments student={student} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}