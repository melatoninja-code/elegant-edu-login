import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingForm } from "@/components/bookings/BookingForm";
import { Booking, BookingFormValues } from "@/types/booking";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface BookingEditDialogProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function BookingEditDialog({ booking, isOpen, onClose, onUpdate }: BookingEditDialogProps) {
  const { toast } = useToast();

  // Fetch classrooms for the form
  const { data: classrooms = [] } = useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classrooms")
        .select("id, name, room_number")
        .eq("is_available", true);

      if (error) throw error;
      return data || [];
    },
  });

  // Get current user's role
  const { data: userRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      return profile?.role;
    },
  });

  const handleSubmit = async (values: BookingFormValues) => {
    try {
      const startDateTime = new Date(values.start_date);
      const [startHours, startMinutes] = values.start_time.split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDateTime = new Date(values.end_date);
      const [endHours, endMinutes] = values.end_time.split(':');
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const { error } = await supabase
        .from('room_bookings')
        .update({
          classroom_id: values.classroom_id,
          teacher_id: values.teacher_id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          purpose: values.purpose,
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking updated successfully",
      });

      onUpdate?.();
      onClose();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update booking",
      });
    }
  };

  // Convert booking data to form values
  const defaultValues: BookingFormValues = {
    classroom_id: booking.classroom_id,
    teacher_id: booking.teacher_id,
    start_date: parseISO(booking.start_time),
    start_time: format(parseISO(booking.start_time), 'HH:mm'),
    end_date: parseISO(booking.end_time),
    end_time: format(parseISO(booking.end_time), 'HH:mm'),
    purpose: booking.purpose,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <BookingForm
          classrooms={classrooms}
          onSubmit={handleSubmit}
          isAdmin={userRole === 'admin'}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  );
}