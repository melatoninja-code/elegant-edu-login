import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GradeEntryForm } from "./GradeEntryForm";

interface GradeEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grade?: {
    id: string;
    student_id: string;
    teacher_id: string;
    score: number;
    feedback?: string;
  };
}

export function GradeEntryDialog({ open, onClose, onSuccess, grade }: GradeEntryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{grade ? 'Edit' : 'Add New'} Grade</DialogTitle>
        </DialogHeader>
        <GradeEntryForm
          grade={grade}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}