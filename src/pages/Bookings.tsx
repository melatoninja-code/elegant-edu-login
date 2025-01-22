import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BookingList } from "@/components/bookings/BookingList";
import { BookingFormValues } from "@/types/booking";
import { BookingHeader } from "@/components/bookings/BookingHeader";
import { AccessRestriction } from "@/components/bookings/AccessRestriction";
import { BookingDialog } from "@/components/bookings/BookingDialog";

export default function Bookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasTeacherTag, setHasTeacherTag] = useState<boolean>(false);
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string; room_number: string }>>([]);

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
        console.log('Current user:', user);
        
        if (user) {
          setUserId(user.id);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          console.log('User profile:', profile);
          
          if (profile) {
            setUserRole(profile.role);
          }

          const { data: teacher } = await supabase
            .from('teachers')
            .select('id')
            .eq('auth_id', user.id)
            .maybeSingle();
          
          console.log('Teacher data:', teacher);
          
          if (teacher) {
            setTeacherId(teacher.id);
            
            const { data: teacherTags } = await supabase
              .from('teacher_tags')
              .select('tag')
              .eq('teacher_id', teacher.id);
            
            console.log('Teacher tags:', teacherTags);
            
            if (teacherTags) {
              // Case-insensitive check for the 'teacher' tag
              const hasTag = teacherTags.some(tag => 
                tag.tag.toLowerCase() === 'teacher'
              );
              console.log('Has Teacher tag:', hasTag);
              setHasTeacherTag(hasTag);
            }
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

      return data;
    },
    enabled: Boolean(userRole && (userRole === 'admin' || (teacherId && hasTeacherTag))),
  });

  const handleSubmit = async (values: BookingFormValues) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create bookings.",
      });
      return;
    }

    try {
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
          teacher_id: values.teacher_id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          purpose: values.purpose,
          status: 'pending',
          created_by: userId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your booking request has been submitted for approval.",
      });

      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Booking creation error:', error);
      toast({
        variant: "destructive",
        title: "Error creating booking",
        description: error.message || "Failed to create booking. Please try again.",
      });
    }
  };

  if (userRole === 'user' && !teacherId) {
    return (
      <AccessRestriction 
        message="You need to be registered as a teacher to access the booking system. Please contact an administrator."
      />
    );
  }

  if (!hasTeacherTag && userRole !== 'admin') {
    return (
      <AccessRestriction 
        message="You need to have the 'Teacher' tag to access the booking system. Please contact an administrator to assign you the correct tag."
      />
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <BookingHeader onNewBooking={() => setIsDialogOpen(true)} />
          <div className="p-6">
            <BookingList bookings={bookings || []} />
          </div>
        </div>
      </div>

      <BookingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        classrooms={classrooms}
        isAdmin={userRole === 'admin'}
        teacherId={teacherId || undefined}
      />
    </SidebarProvider>
  );
}
