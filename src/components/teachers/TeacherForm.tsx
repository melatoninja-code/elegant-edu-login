import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { TeacherProfilePicture } from "./TeacherProfilePicture";
import { TeacherPersonalInfoFields } from "./TeacherPersonalInfoFields";
import { TeacherContactInfoFields } from "./TeacherContactInfoFields";
import { FormValues } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.string(),
  studies: z.string().min(2, "Studies must be at least 2 characters"),
  dorm_room: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address").optional(),
});

interface TeacherFormProps {
  teacher?: {
    id: string;
    name: string;
    gender: string;
    dorm_room: string | null;
    studies: string;
    address: string;
    phone_number: string;
    profile_picture_url?: string | null;
    email?: string | null;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
}

export function TeacherForm({ teacher, onClose, onSuccess, open }: TeacherFormProps) {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    teacher?.profile_picture_url || null
  );

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getCurrentUser();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teacher?.name || "",
      gender: teacher?.gender || "",
      dorm_room: teacher?.dorm_room || "",
      studies: teacher?.studies || "",
      address: teacher?.address || "",
      phone_number: teacher?.phone_number || "",
      email: teacher?.email || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        name: values.name,
        gender: values.gender,
        studies: values.studies,
        dorm_room: values.dorm_room || null,
        address: values.address,
        phone_number: values.phone_number,
        email: values.email || null,
        created_by: userId,
        profile_picture_url: profilePictureUrl,
      };

      if (teacher?.id) {
        const { error } = await supabase
          .from("teachers")
          .update(submissionData)
          .eq("id", teacher.id);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("teachers")
          .insert([submissionData]);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Teacher added successfully",
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{teacher ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TeacherProfilePicture
              currentUrl={profilePictureUrl}
              onUpload={setProfilePictureUrl}
            />

            <TeacherPersonalInfoFields form={form} />
            <TeacherContactInfoFields form={form} />

            <div className="flex justify-end gap-2 pt-6 border-t">
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
                className="bg-primary hover:bg-primary-dark"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Saving..."
                ) : teacher ? (
                  "Update Teacher"
                ) : (
                  "Add Teacher"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}