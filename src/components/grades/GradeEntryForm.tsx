import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const gradeFormSchema = z.object({
  student_id: z.string().min(1, "Please select a student"),
  teacher_id: z.string().min(1, "Please select a teacher"),
  score: z.string()
    .refine((val) => !isNaN(Number(val)), "Score must be a number")
    .refine((val) => Number(val) >= 0 && Number(val) <= 100, "Score must be between 0 and 100"),
  feedback: z.string().max(500, "Feedback cannot exceed 500 characters").optional(),
});

type GradeFormValues = z.infer<typeof gradeFormSchema>;

interface GradeEntryFormProps {
  grade?: {
    id: string;
    student_id: string;
    teacher_id: string;
    score: number;
    feedback?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function GradeEntryForm({ grade, onClose, onSuccess }: GradeEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const { toast } = useToast();

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      student_id: grade?.student_id || "",
      teacher_id: grade?.teacher_id || "",
      score: grade?.score?.toString() || "",
      feedback: grade?.feedback || "",
    },
  });

  // Fetch students and teachers when component mounts
  useState(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, teachersResponse] = await Promise.all([
          supabase.from('students').select('id, name').order('name'),
          supabase.from('teachers').select('id, name').order('name'),
        ]);

        if (studentsResponse.error) throw studentsResponse.error;
        if (teachersResponse.error) throw teachersResponse.error;

        setStudents(studentsResponse.data || []);
        setTeachers(teachersResponse.data || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load students and teachers",
        });
      }
    };

    fetchData();
  }, [toast]);

  const onSubmit = async (values: GradeFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const gradeData = {
        student_id: values.student_id,
        teacher_id: values.teacher_id,
        score: parseInt(values.score),
        feedback: values.feedback,
        created_by: userData.user.id,
      };

      let error;
      if (grade) {
        const { error: updateError } = await supabase
          .from("grades")
          .update(gradeData)
          .eq("id", grade.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("grades")
          .insert([gradeData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Grade ${grade ? 'updated' : 'added'} successfully.`,
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="student_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
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

        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Score (0-100)</FormLabel>
              <FormControl>
                <Input type="number" min="0" max="100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (grade ? "Updating..." : "Adding...") : (grade ? "Update" : "Add") + " Grade"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}