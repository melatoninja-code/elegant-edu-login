import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface TeacherContactInfoFieldsProps {
  form: UseFormReturn<FormValues>;
}

export function TeacherContactInfoFields({ form }: TeacherContactInfoFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Address</FormLabel>
            <FormControl>
              <Input {...field} className="border-primary/20 focus-visible:ring-primary" />
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
            <FormLabel className="font-medium">Phone Number</FormLabel>
            <FormControl>
              <Input {...field} className="border-primary/20 focus-visible:ring-primary" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}