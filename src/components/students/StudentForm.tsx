import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
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
import { format, parse } from "date-fns";
import { Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  emergency_contact_1_name: z.string().optional().nullable(),
  emergency_contact_1_phone: z.string().optional().nullable(),
  emergency_contact_2_name: z.string().optional().nullable(),
  emergency_contact_2_phone: z.string().optional().nullable(),
  profile_picture_url: z.string().optional().nullable(),
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      student_id: "",
      gender: "",
      date_of_birth: "",
      address: "",
      phone_number: "",
      grade_level: 1,
      class_section: "",
      status: "active",
      dorm_room: "",
      parent_name: "",
      parent_phone: "",
      emergency_contact_1_name: "",
      emergency_contact_1_phone: "",
      emergency_contact_2_name: "",
      emergency_contact_2_phone: "",
      profile_picture_url: "",
    },
  });

  // Reset form with student data when student prop changes
  useEffect(() => {
    if (student) {
      form.reset({
        name: student.name,
        email: student.email || "",
        student_id: student.student_id,
        gender: student.gender,
        date_of_birth: student.date_of_birth ? format(new Date(student.date_of_birth), "dd/MM/yyyy") : "",
        address: student.address,
        phone_number: student.phone_number || "",
        grade_level: student.grade_level,
        class_section: student.class_section || "",
        status: student.status,
        dorm_room: student.dorm_room || "",
        parent_name: student.parent_name || "",
        parent_phone: student.parent_phone || "",
        emergency_contact_1_name: student.emergency_contact_1_name || "",
        emergency_contact_1_phone: student.emergency_contact_1_phone || "",
        emergency_contact_2_name: student.emergency_contact_2_name || "",
        emergency_contact_2_phone: student.emergency_contact_2_phone || "",
        profile_picture_url: student.profile_picture_url || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        student_id: "",
        gender: "",
        date_of_birth: "",
        address: "",
        phone_number: "",
        grade_level: 1,
        class_section: "",
        status: "active",
        dorm_room: "",
        parent_name: "",
        parent_phone: "",
        emergency_contact_1_name: "",
        emergency_contact_1_phone: "",
        emergency_contact_2_name: "",
        emergency_contact_2_phone: "",
        profile_picture_url: "",
      });
    }
  }, [student, form]);

  async function onSubmit(values: StudentFormValues) {
    try {
      setIsLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      // Parse the date from dd/MM/yyyy format to yyyy-MM-dd for database storage
      const parsedDate = parse(values.date_of_birth, "dd/MM/yyyy", new Date());
      const formattedDate = format(parsedDate, "yyyy-MM-dd");

      const studentData = {
        name: values.name,
        email: values.email,
        student_id: values.student_id,
        gender: values.gender,
        date_of_birth: formattedDate,
        address: values.address,
        phone_number: values.phone_number,
        grade_level: values.grade_level,
        class_section: values.class_section,
        status: values.status,
        dorm_room: values.dorm_room,
        parent_name: values.parent_name,
        parent_phone: values.parent_phone,
        emergency_contact_1_name: values.emergency_contact_1_name,
        emergency_contact_1_phone: values.emergency_contact_1_phone,
        emergency_contact_2_name: values.emergency_contact_2_name,
        emergency_contact_2_phone: values.emergency_contact_2_phone,
        created_by: userData.user.id,
      };

      let error;
      if (student) {
        const { error: updateError } = await supabase
          .from("students")
          .update(studentData)
          .eq("id", student.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("students")
          .insert([studentData]);
        error = insertError;
      }

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !student?.id) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', student.id);

    try {
      const { data, error } = await supabase.functions.invoke('upload-student-photo', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

      // Update the form with the new URL
      form.setValue('profile_picture_url', data.url);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit' : 'Add New'} Student</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {student && (
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={form.watch('profile_picture_url') || ''}
                    alt={form.watch('name')}
                  />
                  <AvatarFallback>
                    {form.watch('name')?.charAt(0)?.toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Change Photo"}
                  </Button>
                </div>
              </div>
            )}
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
