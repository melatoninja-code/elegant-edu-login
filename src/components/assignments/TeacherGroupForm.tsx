import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

interface TeacherGroupFormProps {
  onSuccess: (options?: RefetchOptions) => Promise<QueryObserverResult<any, Error>>;
}

interface FormData {
  name: string;
  type: "class" | "club" | "study_group" | "other";
}

export function TeacherGroupForm({ onSuccess }: TeacherGroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: "",
      type: "class",
    },
  });

  const groupType = watch("type");

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Check if group name already exists
      const { data: existingGroups } = await supabase
        .from("teacher_groups")
        .select("id")
        .eq("name", data.name)
        .single();

      if (existingGroups) {
        toast({
          title: "Error",
          description: "A group with this name already exists",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("teacher_groups").insert({
        name: data.name,
        type: data.type,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group created successfully",
      });

      reset();
      onSuccess();
    } catch (error: any) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Input
            placeholder="Group Name"
            {...register("name", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Select
            value={groupType}
            onValueChange={(value) => setValue("type", value as FormData["type"])}
          >
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
      </div>
      <Button type="submit" disabled={isSubmitting}>
        Create Group
      </Button>
    </form>
  );
}