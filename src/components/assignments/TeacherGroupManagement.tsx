import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, UserMinus, Users, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TeacherGroupForm } from "./TeacherGroupForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Group {
  id: string;
  name: string;
  type: string;
  teacher: { id: string; name: string } | null;
  students: Array<{ id: string; name: string }>;
}

export function TeacherGroupManagement() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const { toast } = useToast();

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
  });

  const { data: groups, refetch } = useQuery({
    queryKey: ["teacherGroups", selectedTeacher],
    queryFn: async () => {
      let query = supabase
        .from("teacher_groups")
        .select(`
          id,
          name,
          type,
          teacher:teachers(id, name),
          teacher_groups_students:teacher_group_student_assignments(
            student:students(
              id,
              name
            )
          )
        `);

      if (selectedTeacher) {
        query = query.eq("teacher_id", selectedTeacher);
      }

      const { data: groups, error: groupsError } = await query;

      if (groupsError) throw groupsError;

      return groups.map((group) => ({
        id: group.id,
        name: group.name,
        type: group.type,
        teacher: group.teacher,
        students: group.teacher_groups_students
          .map((assignment) => assignment.student)
          .filter((s): s is { id: string; name: string } => s !== null),
      }));
    },
  });

  const { data: availableStudents } = useQuery({
    queryKey: ["availableStudents", selectedGroup],
    enabled: !!selectedGroup,
    queryFn: async () => {
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id, name")
        .eq("status", "active")
        .order("name");

      if (studentsError) throw studentsError;

      const { data: assignments, error: assignmentsError } = await supabase
        .from("teacher_group_student_assignments")
        .select("student_id")
        .eq("group_id", selectedGroup);

      if (assignmentsError) throw assignmentsError;

      const assignedIds = assignments.map((a) => a.student_id);
      return students.filter((student) => !assignedIds.includes(student.id));
    },
  });

  const handleAssignStudent = async (studentId: string) => {
    if (!selectedGroup) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("teacher_group_student_assignments")
        .insert({
          group_id: selectedGroup,
          student_id: studentId,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student assigned to group successfully",
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

  const handleRemoveStudent = async (studentId: string, groupId: string) => {
    try {
      const { error } = await supabase
        .from("teacher_group_student_assignments")
        .delete()
        .eq("group_id", groupId)
        .eq("student_id", studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student removed from group successfully",
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={selectedTeacher || ''} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a teacher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Teachers</SelectItem>
            {teachers?.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TeacherGroupForm onSuccess={refetch} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {groups?.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span className="truncate">{group.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedGroup(group.id)}
                  className="ml-2"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit">
                  {group.type}
                </Badge>
                {group.teacher && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <School className="h-3 w-3" />
                    {group.teacher.name}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {group.students.length} students
                </span>
              </div>
              <ScrollArea className="h-[100px]">
                <div className="space-y-2">
                  {group.students.map((student) => (
                    <Badge
                      key={student.id}
                      variant="secondary"
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{student.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStudent(student.id, group.id)}
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
      </div>

      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Students to Group</DialogTitle>
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