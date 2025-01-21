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
      <div className="text-center py-8 text-muted-foreground">
        No teachers found.
        {isAdmin && " Add one to get started."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="hidden md:table-cell">Gender</TableHead>
            <TableHead className="hidden md:table-cell">Studies</TableHead>
            <TableHead className="hidden lg:table-cell">Dorm Room</TableHead>
            <TableHead className="hidden lg:table-cell">Address</TableHead>
            <TableHead className="hidden lg:table-cell">Phone</TableHead>
            {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
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
                    onEdit={() => onEditTeacher(teacher)}
                    onDelete={() => onDeleteTeacher(teacher.id)}
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