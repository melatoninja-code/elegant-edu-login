import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Student } from "@/types/student";

export function AssignmentForm() {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: teachers, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeacher || selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select a teacher and at least one student",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the user ID first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase.from("teacher_student_assignments").insert(
        selectedStudents.map((studentId) => ({
          teacher_id: selectedTeacher,
          student_id: studentId,
          created_by: user.id,
        }))
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Students assigned successfully",
      });

      // Reset form
      setSelectedTeacher("");
      setSelectedStudents([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign students",
        variant: "destructive",
      });
    }
  };

  if (isLoadingTeachers || isLoadingStudents) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Teacher</label>
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger>
            <SelectValue placeholder="Select a teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers?.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Select Students</label>
        <div className="border rounded-md p-4 space-y-2">
          {students?.map((student) => (
            <label key={student.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudents([...selectedStudents, student.id]);
                  } else {
                    setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                  }
                }}
                className="rounded border-gray-300"
              />
              <span>{student.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit">
        Assign Students
      </Button>
    </form>
  );
}