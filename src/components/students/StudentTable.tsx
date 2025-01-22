import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Student } from "@/types/student";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { StudentDetailsDialog } from "./StudentDetailsDialog";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  isAdmin: boolean;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function StudentTable({
  students,
  isLoading,
  isAdmin,
  onEditStudent,
  onDeleteStudent,
  currentPage,
  totalPages,
  onPageChange,
}: StudentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!students?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-fadeIn">
        No students found.
        {isAdmin && " Add one to get started."}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-primary/20">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/10">
              <TableHead className="w-[200px] font-semibold">Name</TableHead>
              <TableHead className="hidden md:table-cell font-semibold">Student ID</TableHead>
              <TableHead className="hidden md:table-cell font-semibold">Grade</TableHead>
              <TableHead className="hidden lg:table-cell font-semibold">Status</TableHead>
              <TableHead className="hidden lg:table-cell font-semibold">Phone</TableHead>
              {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => (
              <TableRow 
                key={student.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="font-medium text-left hover:text-primary transition-colors"
                  >
                    {student.name}
                  </button>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {student.student_id}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  Grade {student.grade_level}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge
                    variant="secondary"
                    className={`capitalize ${getStatusColor(student.status)}`}
                  >
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {student.phone_number || "-"}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditStudent(student)}
                        className="h-8 w-8 min-w-8 border-primary/20 hover:bg-primary/5"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDeleteStudent(student.id)}
                        className="h-8 w-8 min-w-8 border-primary/20 hover:bg-primary/5 hover:text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <StudentDetailsDialog
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </>
  );
}