import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface GradeTableProps {
  grades: any[];
  isLoading: boolean;
  isAdmin: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function GradeTable({
  grades,
  isLoading,
  isAdmin,
  currentPage,
  totalPages,
  onPageChange,
}: GradeTableProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
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

  if (!grades?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-fadeIn">
        No grades found.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-primary/20">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/10">
              <TableHead className="font-semibold">Student</TableHead>
              <TableHead className="font-semibold">Student ID</TableHead>
              <TableHead className="font-semibold">Score</TableHead>
              <TableHead className="hidden md:table-cell font-semibold">Teacher</TableHead>
              <TableHead className="hidden lg:table-cell font-semibold">Feedback</TableHead>
              <TableHead className="hidden lg:table-cell font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((grade, index) => (
              <TableRow 
                key={grade.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell className="font-medium">
                  {grade.student?.name || "Unknown Student"}
                </TableCell>
                <TableCell>{grade.student?.student_id || "N/A"}</TableCell>
                <TableCell>
                  <span className={`font-bold ${getScoreColor(grade.score)}`}>
                    {grade.score}%
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {grade.teacher?.name || "Unknown Teacher"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {grade.feedback || "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {format(new Date(grade.created_at), "MMM d, yyyy")}
                </TableCell>
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
    </>
  );
}