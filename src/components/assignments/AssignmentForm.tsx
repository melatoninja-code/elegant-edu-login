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
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/types/student";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const BATCH_SIZE = 100; // Process 100 assignments at a time
const STUDENTS_PER_PAGE = 50;

export function AssignmentForm() {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students", currentPage, searchQuery],
    queryFn: async () => {
      let baseQuery = supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Apply search filter if query exists
      if (searchQuery) {
        baseQuery = baseQuery.ilike("name", `%${searchQuery}%`);
      }

      // Get total count first
      const { count } = await baseQuery;
      const totalCount = count || 0;

      // Then get paginated data with a separate query
      const { data, error } = await supabase
        .from("students")
        .select("id, name")
        .eq("status", "active")
        .order("name")
        .range(
          currentPage * STUDENTS_PER_PAGE,
          (currentPage + 1) * STUDENTS_PER_PAGE - 1
        );

      if (error) throw error;

      return {
        students: data,
        totalCount,
      };
    },
  });

  const processBatch = async (userId: string, batch: string[]) => {
    const { error } = await supabase.from("teacher_student_assignments").insert(
      batch.map((studentId) => ({
        teacher_id: selectedTeacher,
        student_id: studentId,
        created_by: userId,
      }))
    );
    if (error) throw error;
  };

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

    setIsSubmitting(true);

    try {
      // Get user ID first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Process assignments in batches
      for (let i = 0; i < selectedStudents.length; i += BATCH_SIZE) {
        const batch = selectedStudents.slice(i, i + BATCH_SIZE);
        await processBatch(user.id, batch);
      }

      toast({
        title: "Success",
        description: "Students assigned successfully",
      });

      // Reset form
      setSelectedTeacher("");
      setSelectedStudents([]);
    } catch (error: any) {
      console.error("Assignment error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign students",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil((studentsData?.totalCount || 0) / STUDENTS_PER_PAGE);

  if (isLoadingTeachers || isLoadingStudents) {
    return <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>;
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
        <Input
          type="search"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(0); // Reset to first page on search
          }}
          className="mb-4"
        />
        <div className="border rounded-md p-4 space-y-2 max-h-[400px] overflow-y-auto">
          {studentsData?.students?.map((student) => (
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Assigning Students...
          </>
        ) : (
          "Assign Students"
        )}
      </Button>
    </form>
  );
}