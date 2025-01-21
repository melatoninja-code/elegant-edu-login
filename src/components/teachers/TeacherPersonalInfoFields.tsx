import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface TeacherPersonalInfoFieldsProps {
  form: UseFormReturn<FormValues>;
}

export function TeacherPersonalInfoFields({ form }: TeacherPersonalInfoFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Name</FormLabel>
            <FormControl>
              <Input {...field} className="border-primary/20 focus-visible:ring-primary" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Gender</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="border-primary/20 focus-visible:ring-primary bg-white">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-primary/20 shadow-lg z-[100]">
                <SelectItem value="male" className="hover:bg-primary/5 focus:bg-primary/5">Male</SelectItem>
                <SelectItem value="female" className="hover:bg-primary/5 focus:bg-primary/5">Female</SelectItem>
                <SelectItem value="other" className="hover:bg-primary/5 focus:bg-primary/5">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="studies"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Studies</FormLabel>
            <FormControl>
              <Input {...field} className="border-primary/20 focus-visible:ring-primary" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dorm_room"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Dorm Room (Optional)</FormLabel>
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