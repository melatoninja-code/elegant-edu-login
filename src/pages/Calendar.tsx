import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingDialog } from "@/components/bookings/BookingDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookingFormValues } from "@/types/booking";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
  // State management for calendar and booking dialog
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [key, setKey] = useState(0); // Used to force re-render calendar when date changes
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Fetch current user's role and teacher ID using React Query
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      try {
        // Get authenticated user from Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("Not authenticated");

        // Get user profile with role information
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) throw new Error("Profile not found");

        // Get teacher information if the user is a teacher
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
          teacherId: teacher?.id,
          userId: user.id
        };
      } catch (error: any) {
        console.error("Error in userInfo query:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user information",
        });
        return { role: null, teacherId: null, userId: null };
      }
    }
  });

  // Fetch available classrooms for booking
  const { data: classrooms = [] } = useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classrooms")
        .select("id, name, room_number")
        .eq("is_available", true);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch all bookings with classroom and teacher details
  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_bookings")
        .select(`
          *,
          classroom:classrooms (
            name,
            room_number
          ),
          teacher:teachers (
            name
          )
        `);

      if (error) throw error;
      return data || [];
    }
  });

  // Handle date selection in calendar
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    setKey(prev => prev + 1); // Force calendar re-render
  };

  // Handle booking creation with validation and error handling
  const handleCreateBooking = async (values: BookingFormValues) => {
    // Validate teacher permissions
    if (!userInfo?.teacherId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be a teacher to create bookings.",
      });
      return;
    }

    // Validate user authentication
    if (!userInfo?.userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create bookings.",
      });
      return;
    }

    try {
      // Convert form dates and times to proper format
      const startDateTime = new Date(values.start_date);
      const [startHours, startMinutes] = values.start_time.split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDateTime = new Date(values.end_date);
      const [endHours, endMinutes] = values.end_time.split(':');
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      // Create booking in database
      const { error } = await supabase
        .from('room_bookings')
        .insert({
          classroom_id: values.classroom_id,
          teacher_id: values.teacher_id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          purpose: values.purpose,
          status: 'pending',
          created_by: userInfo.userId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking request submitted successfully.",
      });
      setIsBookingDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create booking.",
      });
    }
  };

  // Helper function to filter bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-neutral-light/50">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-2 md:p-6">
          {/* Header section with title and new booking button */}
          <div className="flex items-center justify-between gap-4 p-6 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Calendar</h1>
            </div>
            {(userInfo?.role === 'admin' || userInfo?.teacherId) && (
              <Button
                onClick={() => setIsBookingDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            )}
          </div>

          {/* Main content area with calendar and booking details */}
          <div className="container mx-auto py-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Calendar card with booking indicators */}
              <Card className="bg-white shadow-md md:col-span-2">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg text-primary md:text-xl">
                    Room Bookings Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent className={cn(
                  "pt-4",
                  isMobile ? "px-2" : "p-4"
                )}>
                  <div key={key} className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      className={cn(
                        "rounded-md border w-full max-w-[350px]",
                        isMobile ? "transform-none" : "transform origin-top"
                      )}
                      components={{
                        DayContent: ({ date: dayDate, ...props }) => (
                          <div
                            {...props}
                            className="relative w-full h-full flex items-center justify-center"
                          >
                            <span>{dayDate.getDate()}</span>
                            {/* Booking indicator dot */}
                            {getBookingsForDate(dayDate).length > 0 && (
                              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                            )}
                          </div>
                        ),
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bookings details card for selected date */}
              {date && (
                <div className="space-y-4">
                  <Card className="bg-white shadow-md">
                    <CardHeader className="pb-3 border-b bg-primary-lighter">
                      <CardTitle className="text-lg text-primary-dark md:text-xl">
                        {format(date, 'MMMM d, yyyy')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {getBookingsForDate(date).length > 0 ? (
                          getBookingsForDate(date).map((booking) => (
                            <div
                              key={booking.id}
                              className="p-4 rounded-lg border border-neutral-200 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">
                                  {booking.classroom.name} ({booking.classroom.room_number})
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "capitalize",
                                    booking.status === "pending" && "bg-yellow-500/10 text-yellow-500",
                                    booking.status === "approved" && "bg-green-500/10 text-green-500",
                                    booking.status === "rejected" && "bg-red-500/10 text-red-500"
                                  )}
                                >
                                  {booking.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
                              </p>
                              {booking.teacher?.name && (
                                <p className="text-sm text-muted-foreground">
                                  Teacher: {booking.teacher.name}
                                </p>
                              )}
                              <p className="text-sm">{booking.purpose}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No bookings for this date.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Booking dialog for creating new bookings */}
      <BookingDialog
        isOpen={isBookingDialogOpen}
        onOpenChange={setIsBookingDialogOpen}
        onSubmit={handleCreateBooking}
        classrooms={classrooms}
        isAdmin={userInfo?.role === 'admin'}
        teacherId={userInfo?.teacherId}
      />
    </SidebarProvider>
  );
}