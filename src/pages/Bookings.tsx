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
import { Skeleton } from "@/components/ui/skeleton";

export default function Bookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasTeacherTag, setHasTeacherTag] = useState<boolean>(false);
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string; room_number: string }>>([]);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const { data, error } = await supabase
          .from('classrooms')
          .select('id, name, room_number')
          .eq('is_available', true);
        
        if (error) {
          console.error('Error fetching classrooms:', error);
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
      } catch (error: any) {
        console.error('Error in fetchClassrooms:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch classrooms. Please try again.",
        });
      }
    };

    fetchClassrooms();
  }, [toast]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoadingUserData(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to fetch user data. Please try logging in again.",
          });
          return;
        }

        if (!user) {
          console.log('No user found');
          setIsLoadingUserData(false);
          return;
        }

        setUserId(user.id);
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch user profile.",
          });
          return;
        }

        if (profile) {
          setUserRole(profile.role);
        }

        // Fetch teacher data if it exists
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
            description: "Failed to retrieve teacher information.",
          });
          return;
        }
        
        if (teacher) {
          setTeacherId(teacher.id);
          
          // Fetch teacher tags
          const { data: teacherTags, error: tagsError } = await supabase
            .from('teacher_tags')
            .select('tag')
            .eq('teacher_id', teacher.id);
          
          if (tagsError) {
            console.error('Error fetching teacher tags:', tagsError);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to fetch teacher tags.",
            });
            return;
          }
          
          if (teacherTags) {
            const hasTag = teacherTags.some(tag => 
              tag.tag.toLowerCase() === 'teacher'
            );
            setHasTeacherTag(hasTag);
          }
        }
      } catch (error: any) {
        console.error('Error in fetchUserData:', error);
        toast({
          variant: "destructive",
          title: "Error fetching user data",
          description: "Please try again later or contact support if the problem persists.",
        });
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [toast]);

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      console.log('Fetching bookings with userRole:', userRole, 'teacherId:', teacherId, 'hasTeacherTag:', hasTeacherTag);
      
      try {
        const { data, error } = await supabase
          .from('room_bookings')
          .select(`
            *,
            classroom:classrooms (
              name,
              room_number
            )
          `)
          .gte('end_time', new Date().toISOString()) // Only show current and future bookings
          .order('start_time', { ascending: true });  // Order by start time

        if (error) {
          console.error('Error fetching bookings:', error);
          toast({
            variant: "destructive",
            title: "Error fetching bookings",
            description: error.message,
          });
          return [];
        }

        // Log the fetched bookings to check their status
        console.log('Fetched bookings:', data?.map(booking => ({
          id: booking.id,
          status: booking.status,
          start_time: booking.start_time,
          end_time: booking.end_time
        })));
        
        return data;
      } catch (error: any) {
        console.error('Error in bookings query:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch bookings. Please try again.",
        });
        return [];
      }
    },
    enabled: Boolean(userRole && (userRole === 'admin' || (teacherId && hasTeacherTag))),
    refetchInterval: 60000, // Refetch every minute to keep data fresh
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

  if (isLoadingUserData) {
    return (
      <SidebarProvider>
        <div className="flex h-screen bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <div className="h-16 border-b flex items-center px-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-9 w-28 ml-auto" />
            </div>
            <div className="p-6 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

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
      <div className="flex h-screen bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <BookingHeader onNewBooking={() => setIsDialogOpen(true)} />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1600px]">
              {isLoadingBookings ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <BookingList bookings={bookings || []} />
              )}
            </div>
          </main>
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