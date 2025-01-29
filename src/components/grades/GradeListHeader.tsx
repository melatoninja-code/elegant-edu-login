import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface GradeListHeaderProps {
  isAdmin: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddGrade?: () => void;
}

export function GradeListHeader({ 
  isAdmin, 
  searchQuery, 
  onSearchChange, 
  onAddGrade 
}: GradeListHeaderProps) {
  return (
    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 bg-primary/5 rounded-t-lg">
      <div>
        <CardTitle className="text-xl font-bold text-primary-dark">Student Grades</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage student grades
        </p>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial max-w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        {isAdmin && onAddGrade && (
          <Button 
            onClick={onAddGrade}
            className="bg-primary hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Grade</span>
          </Button>
        )}
      </div>
    </CardHeader>
  );
}