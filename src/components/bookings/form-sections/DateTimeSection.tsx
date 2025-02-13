import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { UseFormReturn } from "react-hook-form";
import { BookingFormValues } from "@/types/booking";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface DateTimeSectionProps {
  form: UseFormReturn<BookingFormValues>;
  timeOptions: string[];
}

export function DateTimeSection({ form, timeOptions }: DateTimeSectionProps) {
  const handleDateSelect = (date: Date | undefined, fieldName: "start_date" | "end_date") => {
    if (!date) return;
    
    form.setValue(fieldName, date, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    if (fieldName === "start_date") {
      const endDate = form.getValues("end_date");
      if (!endDate || endDate < date) {
        form.setValue("end_date", date, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Dialog>
                <DialogTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal bg-white",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : "Select date"}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </DialogTrigger>
                <DialogContent className="p-0 max-w-fit bg-white">
                  <CalendarComponent
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => handleDateSelect(date, "start_date")}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </DialogContent>
              </Dialog>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select time">
                      {field.value || "Select time"}
                    </SelectValue>
                    <Clock className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border rounded-md shadow-lg max-h-[300px]">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
              <Dialog>
                <DialogTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal bg-white",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : "Select date"}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </DialogTrigger>
                <DialogContent className="p-0 max-w-fit bg-white">
                  <CalendarComponent
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => handleDateSelect(date, "end_date")}
                    disabled={(date) => {
                      const startDate = form.getValues("start_date");
                      return date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                             (startDate && date < startDate);
                    }}
                    initialFocus
                  />
                </DialogContent>
              </Dialog>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select time">
                      {field.value || "Select time"}
                    </SelectValue>
                    <Clock className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border rounded-md shadow-lg max-h-[300px]">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}