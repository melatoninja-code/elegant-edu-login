import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface StudentListHeaderProps {
  isAdmin: boolean;
  onAddStudent: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function StudentListHeader({ 
  isAdmin, 
  onAddStudent, 
  searchQuery, 
  onSearchChange 
}: StudentListHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-primary/5 rounded-t-lg">
      <div className="flex flex-col gap-4 flex-1">
        <CardTitle className="text-2xl font-bold text-primary-dark">Students</CardTitle>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      {isAdmin && (
        <Button 
          onClick={onAddStudent}
          className="bg-primary hover:bg-primary-dark transition-colors ml-4"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      )}
    </CardHeader>
  );
}