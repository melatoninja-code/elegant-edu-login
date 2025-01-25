import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { BookingFormValues } from "@/types/booking";

interface PurposeSectionProps {
  form: UseFormReturn<BookingFormValues>;
}

export function PurposeSection({ form }: PurposeSectionProps) {
  return (
    <FormField
      control={form.control}
      name="purpose"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Purpose</FormLabel>
          <FormControl>
            <Textarea {...field} className="min-h-[100px] bg-white border-2" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}