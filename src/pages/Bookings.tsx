import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface Booking {
  id: string;
  classroom_id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  purpose: string;
  classroom: {
    name: string;
    room_number: string;
  };
}

const bookingFormSchema = z.object({
  classroom_id: z.string().min(1, "Please select a classroom"),
  start_date: z.date({
    required_error: "Please select a start date",
  }),
  start_time: z.string().min(1, "Please select a start time"),
  end_date: z.date({
    required_error: "Please select an end date",
  }),
  end_time: z.string().min(1, "Please select an end time"),
  purpose: z.string().min(1, "Please provide a purpose for the booking"),
});

export default function Bookings() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string; room_number: string }>>([]);

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      classroom_id: "",
      start_date: undefined,
      start_time: "",
      end_date: undefined,
      end_time: "",
      purpose: "",
    },
  });

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
          setUserId(user.id); // Store the user ID
          
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
  const { data: bookings, isLoading, refetch } = useQuery({
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

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  const onSubmit = async (values: z.infer<typeof bookingFormSchema>) => {
    if (!teacherId || !userId) return;

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
      toast({
        variant: "destructive",
        title: "Error creating booking",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Booking created",
      description: "Your booking request has been submitted for approval.",
    });

    setIsDialogOpen(false);
    form.reset();
    refetch();
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
            {bookings?.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <div className="grid gap-4">
                {bookings?.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border rounded-lg shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {booking.classroom.name} ({booking.classroom.room_number})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(booking.start_time)} - {formatDateTime(booking.end_time)}
                        </p>
                        <p className="mt-2">{booking.purpose}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : booking.status === "cancelled"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="classroom_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classroom</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a classroom</option>
                        {classrooms.map((classroom) => (
                          <option key={classroom.id} value={classroom.id}>
                            {classroom.name} ({classroom.room_number})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(hour) => {
                            const [, minute] = field.value.split(':');
                            field.onChange(`${hour}:${minute || '00'}`);
                          }}
                          value={field.value.split(':')[0] || ''}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[110px]">
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={(minute) => {
                            const [hour] = field.value.split(':');
                            field.onChange(`${hour || '00'}:${minute}`);
                          }}
                          value={field.value.split(':')[1] || ''}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[110px]">
                              <SelectValue placeholder="Minute" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                              <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                                {minute.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < form.getValues("start_date")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(hour) => {
                            const [, minute] = field.value.split(':');
                            field.onChange(`${hour}:${minute || '00'}`);
                          }}
                          value={field.value.split(':')[0] || ''}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[110px]">
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={(minute) => {
                            const [hour] = field.value.split(':');
                            field.onChange(`${hour || '00'}:${minute}`);
                          }}
                          value={field.value.split(':')[1] || ''}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[110px]">
                              <SelectValue placeholder="Minute" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                              <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                                {minute.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter the purpose of booking" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Booking</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
