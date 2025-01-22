import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
});

export function StudentForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
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
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      const { error } = await supabase.from("students").insert({
        ...values,
        created_by: userData.user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student added successfully.",
      });

      form.reset();
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
    <Card>
      <CardHeader>
        <CardTitle>Add New Student</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields will be added here */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Student"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}