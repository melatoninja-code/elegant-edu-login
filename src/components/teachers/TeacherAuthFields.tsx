import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type TeacherAuthFields = z.infer<typeof authSchema>;

interface TeacherAuthFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export function TeacherAuthFields({ form, isEditing }: TeacherAuthFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);

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
              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  className="border-primary/20 focus-visible:ring-primary pr-10"
                  placeholder="Min. 6 characters"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-neutral-500" />
                  )}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}