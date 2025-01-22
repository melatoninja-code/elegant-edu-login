import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingForm } from "@/components/bookings/BookingForm";
import { BookingFormValues } from "@/types/booking";

interface BookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BookingFormValues) => Promise<void>;
  classrooms: Array<{ id: string; name: string; room_number: string }>;
  isAdmin: boolean;
  teacherId?: string;
}

export function BookingDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  classrooms,
  isAdmin,
  teacherId,
}: BookingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
        </DialogHeader>
        <BookingForm
          classrooms={classrooms}
          onSubmit={onSubmit}
          isAdmin={isAdmin}
          defaultTeacherId={teacherId}
        />
      </DialogContent>
    </Dialog>
  );
}