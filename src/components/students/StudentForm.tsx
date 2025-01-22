import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Student } from "@/types/student";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
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
  parent_name: z.string().optional().nullable(),
  parent_phone: z.string().optional().nullable(),
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
        name: values.name,
        email: values.email,
        student_id: values.student_id,
        gender: values.gender,
        date_of_birth: values.date_of_birth,
        address: values.address,
        phone_number: values.phone_number,
        grade_level: values.grade_level,
        class_section: values.class_section,
        status: values.status,
        dorm_room: values.dorm_room,
        parent_name: values.parent_name,
        parent_phone: values.parent_phone,
        created_by: userData.user.id,
      };

      const { error } = student
        ? await supabase
            .from("students")
            .update(studentData)
            .eq("id", student.id)
        : await supabase
            .from("students")
            .insert([studentData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Student ${student ? 'updated' : 'added'} successfully.`,
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
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle>{student ? 'Edit' : 'Add New'} Student</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PersonalInfoSection form={form} />
            <ContactInfoSection form={form} />
            <ParentInfoSection form={form} />
            <AcademicInfoSection form={form} />
            
            <div className="flex justify-end gap-2 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (student ? "Updating..." : "Adding...") : (student ? "Update" : "Add") + " Student"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}