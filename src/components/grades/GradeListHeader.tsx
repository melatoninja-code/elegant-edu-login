import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface GradeListHeaderProps {
  isAdmin: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function GradeListHeader({ 
  isAdmin, 
  searchQuery, 
  onSearchChange 
}: GradeListHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-primary/5 rounded-t-lg">
      <div className="flex flex-col gap-4 flex-1">
        <CardTitle className="text-2xl font-bold text-primary-dark">Grades</CardTitle>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
    </CardHeader>
  );
}