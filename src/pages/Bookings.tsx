import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BookingForm } from "@/components/bookings/BookingForm";
import { BookingList } from "@/components/bookings/BookingList";
import { Booking, BookingFormValues } from "@/types/booking";

export default function Bookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string; room_number: string }>>([]);

  // Fetch classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('id, name, room_number')
        .eq('is_available', true);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching classrooms",
          description: error.message,
        });
        return;
      }

      if (data) {
        setClassrooms(data);
      }
    };

    fetchClassrooms();
  }, [toast]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          if (profile) {
            setUserRole(profile.role);
          }

          const { data: teacher, error: teacherError } = await supabase
            .from('teachers')
            .select('id')
            .eq('auth_id', user.id)
            .maybeSingle();
          
          if (teacherError) {
            console.error('Error fetching teacher:', teacherError);
            toast({
              variant: "destructive",
              title: "Error fetching teacher data",
              description: "Please try again later or contact support if the problem persists.",
            });
            return;
          }
          
          if (teacher) {
            setTeacherId(teacher.id);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          variant: "destructive",
          title: "Error fetching user data",
          description: "Please try again later or contact support if the problem persists.",
        });
      }
    };

    fetchUserData();
  }, [toast]);

  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const query = supabase
        .from('room_bookings')
        .select(`
          *,
          classroom:classrooms (
            name,
            room_number
          )
        `);

      if (userRole !== 'admin') {
        query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching bookings",
          description: error.message,
        });
        return [];
      }

      return data as Booking[];
    },
    enabled: Boolean(userRole && (userRole === 'admin' || teacherId)),
  });

  const handleSubmit = async (values: BookingFormValues) => {
    if (!teacherId || !userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in as a teacher to create bookings.",
      });
      return;
    }

    try {
      console.log('Creating booking with values:', {
        ...values,
        teacher_id: teacherId,
        created_by: userId
      }); // Debug log

      const startDateTime = new Date(values.start_date);
      const [startHours, startMinutes] = values.start_time.split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDateTime = new Date(values.end_date);
      const [endHours, endMinutes] = values.end_time.split(':');
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const { error } = await supabase
        .from('room_bookings')
        .insert({
          classroom_id: values.classroom_id,
          teacher_id: teacherId,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          purpose: values.purpose,
          status: 'pending',
          created_by: userId
        });

      if (error) {
        console.error('Error creating booking:', error); // Debug log
        throw error;
      }

      toast({
        title: "Success",
        description: "Your booking request has been submitted for approval.",
      });

      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Booking creation error:', error); // Debug log
      toast({
        variant: "destructive",
        title: "Error creating booking",
        description: error.message || "Failed to create booking. Please try again.",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (userRole === 'user' && !teacherId) {
    return (
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="p-6">
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <h2 className="text-lg font-semibold text-destructive">Access Restricted</h2>
              <p className="mt-2">You need to be registered as a teacher to access the booking system. Please contact an administrator.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Room Bookings</h1>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </div>
          <div className="p-6">
            <BookingList bookings={bookings || []} />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
          </DialogHeader>
          <BookingForm classrooms={classrooms} onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}