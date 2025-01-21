import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface TeacherListHeaderProps {
  isAdmin: boolean;
  onAddTeacher: () => void;
}

export function TeacherListHeader({ isAdmin, onAddTeacher }: TeacherListHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle className="text-2xl font-bold">Teachers</CardTitle>
      {isAdmin && (
        <Button onClick={onAddTeacher}>
          <Plus className="mr-2" />
          Add Teacher
        </Button>
      )}
    </CardHeader>
  );
}