import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Booking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Trash2, Check, X, Pencil } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { BookingEditDialog } from "./BookingEditDialog";

interface BookingCardProps {
  booking: Booking;
  onDelete?: () => void;
  onStatusChange?: () => void;
}

export function BookingCard({ booking, onDelete, onStatusChange }: BookingCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Get current user's role and teacher ID with better error handling
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("Not authenticated");

        // Get user role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) throw new Error("Profile not found");

        // Get teacher ID if exists
        const { data: teacher, error: teacherError } = await supabase
          .from("teachers")
          .select("id")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (teacherError) {
          console.error("Error fetching teacher:", teacherError);
        }

        return {
          role: profile.role,
          teacherId: teacher?.id
        };
      } catch (error: any) {
        console.error("Error in userInfo query:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user information",
        });
        return {
          role: null,
          teacherId: null
        };
      }
    }
  });

  const { data: teacherInfo } = useQuery({
    queryKey: ["teacher", booking.teacher_id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("teachers")
          .select("name")
          .eq("id", booking.teacher_id)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error("Error fetching teacher info:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch teacher information",
        });
        return null;
      }
    }
  });

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (userInfo?.role !== 'admin') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only administrators can approve or reject bookings.",
      });
      return;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('room_bookings')
        .update({ status: newStatus })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${newStatus} successfully`,
      });

      onStatusChange?.();
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${newStatus} booking`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('room_bookings')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });

      onDelete?.();
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete booking",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'approved':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">
                {booking.classroom.name} ({booking.classroom.room_number})
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(booking.start_time), "PPP")} -{" "}
                {format(new Date(booking.start_time), "HH:mm")} to{" "}
                {format(new Date(booking.end_time), "HH:mm")}
              </p>
              {teacherInfo && (
                <p className="text-sm text-muted-foreground mt-1">
                  Teacher: {teacherInfo.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`capitalize ${getStatusColor(booking.status)}`}
              >
                {booking.status}
              </Badge>
              {userInfo?.role === 'admin' && booking.status === 'pending' && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-100"
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={isUpdating}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              {userInfo?.role === 'admin' && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-100"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{booking.purpose}</p>
        </div>
      </CardContent>

      <BookingEditDialog
        booking={booking}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={onStatusChange}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}