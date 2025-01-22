import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, isAfter, isBefore, addMinutes } from "date-fns";
import { DialogFooter } from "@/components/ui/dialog";
import { BookingFormValues } from "@/types/booking";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const bookingFormSchema = z.object({
  classroom_id: z.string().min(1, "Please select a classroom"),
  teacher_id: z.string().min(1, "Please select a teacher"),
  start_date: z.date({
    required_error: "Please select a start date",
  }),
  start_time: z.string().min(1, "Please select a start time"),
  end_date: z.date({
    required_error: "Please select an end date",
  }),
  end_time: z.string().min(1, "Please select an end time"),
  purpose: z.string()
    .min(1, "Please provide a purpose for the booking")
    .max(500, "Purpose cannot exceed 500 characters"),
}).refine((data) => {
  const startDateTime = new Date(data.start_date);
  const [startHours, startMinutes] = data.start_time.split(':');
  startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

  const endDateTime = new Date(data.end_date);
  const [endHours, endMinutes] = data.end_time.split(':');
  endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

  return isAfter(endDateTime, startDateTime);
}, {
  message: "End time must be after start time",
  path: ["end_time"],
});

interface BookingFormProps {
  classrooms: Array<{ id: string; name: string; room_number: string }>;
  onSubmit: (values: z.infer<typeof bookingFormSchema>) => Promise<void>;
  isAdmin?: boolean;
  defaultTeacherId?: string;
}

export function BookingForm({ classrooms, onSubmit, isAdmin = false, defaultTeacherId }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching teachers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load teachers list",
        });
        return;
      }

      if (data) {
        setTeachers(data);
      }
    };

    if (isAdmin) {
      fetchTeachers();
    }
  }, [isAdmin, toast]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      classroom_id: "",
      teacher_id: defaultTeacherId || "",
      start_date: undefined,
      start_time: "",
      end_date: undefined,
      end_time: "",
      purpose: "",
    },
  });

  const onSubmitHandler = async (values: BookingFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      toast({
        title: "Success",
        description: "Booking created successfully.",
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create booking. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="classroom_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classroom</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a classroom" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom.id} value={classroom.id}>
                        {classroom.name} - {classroom.room_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teacher_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {field.value ? format(field.value, 'PPP') : "Select a date"}
                      <Calendar className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
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
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {field.value ? format(field.value, 'PPP') : "Select a date"}
                      <Calendar className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
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
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
