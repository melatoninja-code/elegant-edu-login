import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StudentFormValues } from "../StudentForm";

interface ContactInfoSectionProps {
  form: UseFormReturn<StudentFormValues>;
}

export function ContactInfoSection({ form }: ContactInfoSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Home Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main St, City, Country" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="dorm_room"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dorm Room Number</FormLabel>
              <FormControl>
                <Input placeholder="A-101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email (Optional)</FormLabel>
            <FormControl>
              <Input type="email" placeholder="student@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}