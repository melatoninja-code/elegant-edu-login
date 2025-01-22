import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StudentFormValues } from "../StudentForm";

interface ParentInfoSectionProps {
  form: UseFormReturn<StudentFormValues>;
}

export function ParentInfoSection({ form }: ParentInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Parent Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="parent_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Name</FormLabel>
              <FormControl>
                <Input placeholder="Parent's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}