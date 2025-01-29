import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GradeListHeaderProps {
  isAdmin: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddGrade?: () => void;
}

export function GradeListHeader({ isAdmin, searchQuery, onSearchChange, onAddGrade }: GradeListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-semibold">Student Grades</h2>
        <p className="text-sm text-muted-foreground">
          View and manage student grades
        </p>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-[300px]"
        />
        {isAdmin && onAddGrade && (
          <Button onClick={onAddGrade}>
            <Plus className="h-4 w-4 mr-2" />
            Add Grade
          </Button>
        )}
      </div>
    </div>
  );
}