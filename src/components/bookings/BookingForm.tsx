import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DialogFooter } from "@/components/ui/dialog";
import { BookingFormValues } from "@/types/booking";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const validateTimeFormat = (time: string) => {
  if (!time) return true; // Allow empty string during typing
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

const bookingFormSchema = z.object({
  classroom_id: z.string().min(1, "Please select a classroom"),
  teacher_id: z.string().min(1, "Please select a teacher"),
  start_date: z.date({
    required_error: "Please select a start date",
  }),
  start_time: z.string().refine((time) => validateTimeFormat(time), {
    message: "Please enter a valid time in 24-hour format (HH:MM)",
  }),
  end_date: z.date({
    required_error: "Please select an end date",
  }),
  end_time: z.string().refine((time) => validateTimeFormat(time), {
    message: "Please enter a valid time in 24-hour format (HH:MM)",
  }),
  purpose: z.string()
    .min(1, "Please provide a purpose for the booking")
    .max(500, "Purpose cannot exceed 500 characters"),
}).refine((data) => {
  const startDateTime = new Date(data.start_date);
  const [startHours, startMinutes] = data.start_time.split(':').map(Number);
  if (isNaN(startHours) || isNaN(startMinutes)) return true; // Allow partial input during typing

  const endDateTime = new Date(data.end_date);
  const [endHours, endMinutes] = data.end_time.split(':').map(Number);
  if (isNaN(endHours) || isNaN(endMinutes)) return true; // Allow partial input during typing

  startDateTime.setHours(startHours, startMinutes);
  endDateTime.setHours(endHours, endMinutes);

  return endDateTime > startDateTime;
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
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        
        if (data) {
          setTeachers(data);
        }
      } catch (error: any) {
        console.error('Error fetching teachers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load teachers list",
        });
      }
    };

    fetchTeachers();
  }, [toast]);

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
        description: "Your booking request has been submitted for approval.",
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

  const TimeInput = ({ field, label }: { field: any; label: string }) => (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input
          type="text"
          placeholder="HH:MM"
          {...field}
          onChange={(e) => {
            const value = e.target.value;
            field.onChange(value);
          }}
          className="w-full"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="classroom_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classroom</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a classroom" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom.id} value={classroom.id}>
                        {classroom.name} - {classroom.room_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : "Select date"}
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
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
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
                <TimeInput
                  field={field}
                  label="Start Time"
                />
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : "Select date"}
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
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
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
                <TimeInput
                  field={field}
                  label="End Time"
                />
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-[100px]" />
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