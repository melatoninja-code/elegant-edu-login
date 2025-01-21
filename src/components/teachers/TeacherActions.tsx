import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface TeacherActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function TeacherActions({ onEdit, onDelete }: TeacherActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onEdit}
        className="h-8 w-8 border-primary/20 hover:bg-primary/5 transition-colors"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8 border-primary/20 hover:bg-primary/5 hover:text-red-500 transition-colors"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}