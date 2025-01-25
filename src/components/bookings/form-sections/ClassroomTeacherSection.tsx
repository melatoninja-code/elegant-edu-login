import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { BookingFormValues } from "@/types/booking";

interface ClassroomTeacherSectionProps {
  form: UseFormReturn<BookingFormValues>;
  classrooms: Array<{ id: string; name: string; room_number: string }>;
  teachers: Array<{ id: string; name: string }>;
}

export function ClassroomTeacherSection({ form, classrooms, teachers }: ClassroomTeacherSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="classroom_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Classroom</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-white border-2">
                  <SelectValue placeholder="Select a classroom" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white border-2 shadow-lg">
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
                <SelectTrigger className="bg-white border-2">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white border-2 shadow-lg">
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
  );
}