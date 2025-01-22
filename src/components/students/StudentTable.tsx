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

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrollment Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>Grade {student.grade_level}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`capitalize ${getStatusColor(student.status)}`}
                  >
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(student.enrollment_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEditStudent(student)}
                      className="h-8 w-8 min-w-8 border-primary/20 hover:bg-primary/5"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDeleteStudent(student.id)}
                        className="h-8 w-8 min-w-8 border-primary/20 hover:bg-primary/5 hover:text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
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
    </div>
  );
}