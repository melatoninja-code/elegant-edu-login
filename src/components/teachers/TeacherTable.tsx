import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Teacher } from "./types";
import { TeacherActions } from "./TeacherActions";

interface TeacherTableProps {
  teachers: Teacher[] | null;
  isLoading: boolean;
  isAdmin: boolean;
  onSelectTeacher: (teacher: Teacher) => void;
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
                onClick={() => onSelectTeacher(teacher)}
              >
                {teacher.name}
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