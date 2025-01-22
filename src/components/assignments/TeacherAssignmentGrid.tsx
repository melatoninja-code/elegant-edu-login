import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, UserMinus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TeacherWithStudents {
  id: string;
  name: string;
  students: Array<{ id: string; name: string }>;
}

export function TeacherAssignmentGrid() {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: teachersWithStudents, refetch } = useQuery({
    queryKey: ["teachersWithStudents"],
    queryFn: async () => {
      // First get all teachers
      const { data: teachers, error: teachersError } = await supabase
        .from("teachers")
        .select("id, name")
        .order("name");

      if (teachersError) throw teachersError;

      // Then get all assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from("teacher_student_assignments")
        .select(`
          teacher_id,
          student:students (
            id,
            name
          )
        `);

      if (assignmentsError) throw assignmentsError;

      // Combine the data
      return teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        students: assignments
          .filter((a) => a.teacher_id === teacher.id)
          .map((a) => a.student)
          .filter((s): s is { id: string; name: string } => s !== null),
      }));
    },
  });

  const { data: availableStudents } = useQuery({
    queryKey: ["availableStudents", selectedTeacher],
    enabled: !!selectedTeacher,
    queryFn: async () => {
      // Get all active students
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id, name")
        .eq("status", "active")
        .order("name");

      if (studentsError) throw studentsError;

      // Get current assignments for the selected teacher
      const { data: assignments, error: assignmentsError } = await supabase
        .from("teacher_student_assignments")
        .select("student_id")
        .eq("teacher_id", selectedTeacher);

      if (assignmentsError) throw assignmentsError;

      // Filter out already assigned students
      const assignedIds = assignments.map((a) => a.student_id);
      return students.filter((student) => !assignedIds.includes(student.id));
    },
  });

  const handleAssignStudent = async (studentId: string) => {
    if (!selectedTeacher) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("teacher_student_assignments")
        .insert({
          teacher_id: selectedTeacher,
          student_id: studentId,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student assigned successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign student",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStudent = async (studentId: string, teacherId: string) => {
    try {
      const { error } = await supabase
        .from("teacher_student_assignments")
        .delete()
        .eq("teacher_id", teacherId)
        .eq("student_id", studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student removed successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {teachersWithStudents?.map((teacher) => (
        <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="truncate">{teacher.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTeacher(teacher.id)}
                className="ml-2"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {teacher.students.length} students
              </span>
            </div>
            <ScrollArea className="h-[100px]">
              <div className="space-y-2">
                {teacher.students.map((student) => (
                  <Badge
                    key={student.id}
                    variant="secondary"
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{student.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveStudent(student.id, teacher.id)}
                      className="h-4 w-4 p-0 hover:text-destructive"
                    >
                      <UserMinus className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Students</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] mt-4">
            <div className="space-y-2">
              {availableStudents?.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                >
                  <span>{student.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAssignStudent(student.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}