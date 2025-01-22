import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

interface TeacherGroupFormProps {
  onSuccess: () => Promise<any>;
}

interface FormData {
  name: string;
  type: "class" | "club" | "study_group" | "other";
}

export function TeacherGroupForm({ onSuccess }: TeacherGroupFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: "",
      type: "class",
    },
  });

  const groupType = watch("type");

  // Fetch user role
  const { data: userRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      return profile?.role;
    },
  });

  // Fetch teachers if user is admin
  const { data: teachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: userRole === "admin",
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      if (userRole === "admin" && !selectedTeacher) {
        toast({
          title: "Error",
          description: "Please select a teacher",
          variant: "destructive",
        });
        return;
      }

      // If user is not admin, get their teacher record
      let teacherId = selectedTeacher;
      if (userRole !== "admin") {
        const { data: teacherData } = await supabase
          .from("teachers")
          .select("id")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (!teacherData) {
          throw new Error("No teacher record found for your account");
        }
        teacherId = teacherData.id;
      }

      // Create the group
      const { error: insertError } = await supabase
        .from("teacher_groups")
        .insert({
          name: data.name,
          type: data.type,
          teacher_id: teacherId,
          created_by: user.id,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Group created successfully",
      });

      reset();
      setSelectedTeacher(null);
      setIsOpen(false);
      await onSuccess();
    } catch (error: any) {
      console.error("Group creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Group</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Group Name</label>
            <Input {...register("name", { required: true })} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Group Type</label>
            <Select value={groupType} onValueChange={(value) => setValue("type", value as FormData["type"])}>
              <SelectTrigger>
                <SelectValue placeholder="Select group type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="study_group">Study Group</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {userRole === "admin" && teachers && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Teacher</label>
              <Select value={selectedTeacher || ""} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}