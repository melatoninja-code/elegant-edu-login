import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface TeacherListHeaderProps {
  isAdmin: boolean;
  onAddTeacher: () => void;
}

export function TeacherListHeader({ isAdmin, onAddTeacher }: TeacherListHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-primary/5 rounded-t-lg">
      <CardTitle className="text-2xl font-bold text-primary-dark">Teachers</CardTitle>
      {isAdmin && (
        <Button 
          onClick={onAddTeacher}
          className="bg-primary hover:bg-primary-dark transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      )}
    </CardHeader>
  );
}