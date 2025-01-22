import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Student } from "@/types/student";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { ContactInfoSection } from "./form-sections/ContactInfoSection";
import { ParentInfoSection } from "./form-sections/ParentInfoSection";
import { AcademicInfoSection } from "./form-sections/AcademicInfoSection";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email().optional().nullable(),
  student_id: z.string().min(1, {
    message: "Student ID is required.",
  }),
  gender: z.string().min(1, {
    message: "Gender is required.",
  }),
  date_of_birth: z.string().min(1, {
    message: "Date of birth is required.",
  }),
  address: z.string().min(1, {
    message: "Address is required.",
  }),
  phone_number: z.string().optional().nullable(),
  grade_level: z.number().min(1, {
    message: "Grade level is required.",
  }),
  class_section: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "graduated", "suspended"]),
  dorm_room: z.string().optional().nullable(),
  parent_name: z.string().min(1, {
    message: "Parent name is required.",
  }),
  parent_phone: z.string().min(1, {
    message: "Parent phone number is required.",
  }),
});

export type StudentFormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
  student?: Student | null;
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
}

export function StudentForm({ student, onClose, onSuccess, open }: StudentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student?.name ?? "",
      email: student?.email ?? "",
      student_id: student?.student_id ?? "",
      gender: student?.gender ?? "",
      date_of_birth: student?.date_of_birth ?? "",
      address: student?.address ?? "",
      phone_number: student?.phone_number ?? "",
      grade_level: student?.grade_level ?? 1,
      class_section: student?.class_section ?? "",
      status: student?.status ?? "active",
      dorm_room: student?.dorm_room ?? "",
      parent_name: student?.parent_name ?? "",
      parent_phone: student?.parent_phone ?? "",
    },
  });

  async function onSubmit(values: StudentFormValues) {
    try {
      setIsLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      const studentData = {
        ...values,
        created_by: userData.user.id,
      };

      const { error } = student
        ? await supabase
            .from("students")
            .update(studentData)
            .eq("id", student.id)
        : await supabase
            .from("students")
            .insert(studentData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Student ${student ? 'updated' : 'added'} successfully.`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit' : 'Add New'} Student</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PersonalInfoSection form={form} />
            <ContactInfoSection form={form} />
            <ParentInfoSection form={form} />
            <AcademicInfoSection form={form} />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (student ? "Updating..." : "Adding...") : (student ? "Update" : "Add") + " Student"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}