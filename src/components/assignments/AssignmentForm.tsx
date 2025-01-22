import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Loader2, School, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BATCH_SIZE = 100;

export function AssignmentForm() {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch teachers
  const { data: teachers, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    }
  });

  // Fetch groups for selected teacher
  const { data: teacherGroups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["teacherGroups", selectedTeacher],
    enabled: !!selectedTeacher,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_groups")
        .select("id, name, type")
        .eq("teacher_id", selectedTeacher)
        .order("name");

      if (error) throw error;
      return data;
    }
  });

  // Fetch available students (not in selected group)
  const { data: availableStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["availableStudents", selectedGroup],
    queryFn: async () => {
      if (!selectedGroup) return [];

      const { data: students, error } = await supabase
        .from("students")
        .select("id, name")
        .eq("status", "active")
        .order("name");

      if (error) throw error;

      // Filter out students already in the group
      const { data: existingAssignments } = await supabase
        .from("teacher_group_student_assignments")
        .select("student_id")
        .eq("group_id", selectedGroup);

      const existingStudentIds = existingAssignments?.map(a => a.student_id) || [];
      return students.filter(student => !existingStudentIds.includes(student.id));
    },
    enabled: !!selectedGroup
  });

  const filteredStudents = availableStudents?.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const processBatch = async (userId: string, batch: string[]) => {
    if (!selectedGroup) return;

    const { error } = await supabase
      .from("teacher_group_student_assignments")
      .insert(
        batch.map(studentId => ({
          group_id: selectedGroup,
          student_id: studentId,
          created_by: userId
        }))
      );
    if (error) throw error;
  };

  const handleSubmit = async () => {
    if (!selectedGroup || selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select a group and at least one student",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Process assignments in batches
      for (let i = 0; i < selectedStudents.length; i += BATCH_SIZE) {
        const batch = selectedStudents.slice(i, i + BATCH_SIZE);
        await processBatch(user.id, batch);
      }

      toast({
        title: "Success",
        description: "Students assigned successfully"
      });

      // Reset selections
      setSelectedStudents([]);
      setSelectedGroup(null);
    } catch (error: any) {
      console.error("Assignment error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign students",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTeachers) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 max-w-xl">
        {/* Teacher Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Teacher</label>
          <Select value={selectedTeacher || ""} onValueChange={setSelectedTeacher}>
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

        {/* Group Selection */}
        {selectedTeacher && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Group</label>
            <Select value={selectedGroup || ""} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {teacherGroups?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} ({group.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Student Selection */}
        {selectedGroup && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Available Students
              </CardTitle>
              <Input
                type="search"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardHeader>
            <CardContent>
              {isLoadingStudents ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {filteredStudents?.map(student => (
                      <label
                        key={student.id}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                      >
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
                    {filteredStudents?.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        No students available to assign
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedGroup || selectedStudents.length === 0}
        className="w-full max-w-xl"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Assigning Students...
          </>
        ) : (
          "Assign Students"
        )}
      </Button>
    </div>
  );
}