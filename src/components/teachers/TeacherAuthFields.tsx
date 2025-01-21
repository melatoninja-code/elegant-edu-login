import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type TeacherAuthFields = z.infer<typeof authSchema>;

interface TeacherAuthFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export function TeacherAuthFields({ form, isEditing }: TeacherAuthFieldsProps) {
  if (isEditing) return null;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Email</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                className="border-primary/20 focus-visible:ring-primary"
                placeholder="teacher@school.com"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Password</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="password"
                className="border-primary/20 focus-visible:ring-primary"
                placeholder="Min. 6 characters"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export { authSchema };