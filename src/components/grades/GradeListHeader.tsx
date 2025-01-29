import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface GradeListHeaderProps {
  onAddGrade: () => void;
}

export function GradeListHeader({ onAddGrade }: GradeListHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold">Student Grades</h2>
        <p className="text-sm text-muted-foreground">
          View and manage student grades
        </p>
      </div>
      <Button onClick={onAddGrade}>
        <Plus className="h-4 w-4 mr-2" />
        Add Grade
      </Button>
    </div>
  );
}