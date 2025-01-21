import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle } from "lucide-react";
import { Teacher } from "./types";
import { TeacherActions } from "./TeacherActions";
import { useState } from "react";

interface TeacherTableProps {
  teachers: Teacher[] | null;
  isLoading: boolean;
  isAdmin: boolean;
  onSelectTeacher: (teacher: Teacher, credentials?: { email: string; password: string }) => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

export function TeacherTable({
  teachers,
  isLoading,
  isAdmin,
  onSelectTeacher,
  onEditTeacher,
  onDeleteTeacher,
}: TeacherTableProps) {
  const [teacherCredentials, setTeacherCredentials] = useState<Record<string, { email: string; password: string }>>({});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teachers?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-fadeIn">
        No teachers found.
        {isAdmin && " Add one to get started."}
      </div>
    );
  }

  const handleAccountCreated = (teacherId: string, email: string, password: string) => {
    setTeacherCredentials(prev => ({
      ...prev,
      [teacherId]: { email, password }
    }));
  };

  return (
    <div className="overflow-x-auto rounded-md border border-primary/20">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/5 hover:bg-primary/10">
            <TableHead className="w-[200px] font-semibold">Name</TableHead>
            <TableHead className="hidden md:table-cell font-semibold">Gender</TableHead>
            <TableHead className="hidden md:table-cell font-semibold">Studies</TableHead>
            <TableHead className="hidden lg:table-cell font-semibold">Dorm Room</TableHead>
            <TableHead className="hidden lg:table-cell font-semibold">Address</TableHead>
            <TableHead className="hidden lg:table-cell font-semibold">Phone</TableHead>
            {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher, index) => (
            <TableRow 
              key={teacher.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell
                className="font-medium cursor-pointer hover:text-primary transition-colors"
                onClick={() => onSelectTeacher(teacher, teacherCredentials[teacher.id])}
              >
                <div className="flex items-center gap-2">
                  {teacher.auth_id && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {teacher.name}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell capitalize">
                {teacher.gender}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {teacher.studies}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {teacher.dorm_room || "-"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {teacher.address}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {teacher.phone_number}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <TeacherActions
                    teacher={teacher}
                    onEdit={() => onEditTeacher(teacher)}
                    onDelete={() => onDeleteTeacher(teacher.id)}
                    onAccountCreated={(email, password) => handleAccountCreated(teacher.id, email, password)}
                    isAdmin={isAdmin}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}