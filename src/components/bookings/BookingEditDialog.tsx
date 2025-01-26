import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/types/booking";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface BookingEditDialogProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function BookingEditDialog({ booking, isOpen, onClose, onUpdate }: BookingEditDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    start_time: format(new Date(booking.start_time), "yyyy-MM-dd'T'HH:mm"),
    end_time: format(new Date(booking.end_time), "yyyy-MM-dd'T'HH:mm"),
    status: booking.status,
    purpose: booking.purpose,
  });

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("room_bookings")
        .update({
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
          status: formData.status,
          purpose: formData.purpose,
        })
        .eq("id", booking.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking updated successfully.",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update booking",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="start_time" className="text-sm font-medium">Start Time</label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="end_time" className="text-sm font-medium">End Time</label>
            <Input
              id="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as Booking['status'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="purpose" className="text-sm font-medium">Purpose</label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}