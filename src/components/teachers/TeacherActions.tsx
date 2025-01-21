import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface TeacherActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function TeacherActions({ onEdit, onDelete }: TeacherActionsProps) {
  return (
    <div className="space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}