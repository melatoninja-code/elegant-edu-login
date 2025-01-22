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

const BATCH_SIZE = 100; // Process 100 assignments at a time

export function AssignmentForm() {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch teachers with their groups and students
  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachersWithGroups"],
    queryFn: async () => {
      const { data: teachers, error } = await supabase
        .from("teachers")
        .select(`
          id,
          name,
          teacher_groups (
            id,
            name,
            type,
            teacher_groups_students:teacher_group_student_assignments (
              student:students (
                id,
                name
              )
            )
          )
        `)
        .order("name");

      if (error) throw error;

      return teachers.map(teacher => ({
        ...teacher,
        teacher_groups: teacher.teacher_groups.map(group => ({
          ...group,
          students: group.teacher_groups_students
            .map(assignment => assignment.student)
            .filter((s): s is { id: string; name: string } => s !== null)
        }))
      }));
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
      const selectedTeacherData = teachersData?.find(t => t.id === selectedTeacher);
      const selectedGroupData = selectedTeacherData?.teacher_groups.find(g => g.id === selectedGroup);
      const existingStudentIds = selectedGroupData?.students.map(s => s.id) || [];

      return students.filter(student => !existingStudentIds.includes(student.id));
    },
    enabled: !!selectedGroup
  });

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
      <Input
        type="search"
        placeholder="Search teachers or groups..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachersData?.map(teacher => (
          <Card 
            key={teacher.id}
            className={`hover:shadow-lg transition-shadow ${
              selectedTeacher === teacher.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedTeacher(teacher.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                {teacher.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {teacher.teacher_groups.map(group => (
                    <div 
                      key={group.id} 
                      className={`space-y-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
                        selectedGroup === group.id ? 'bg-accent' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGroup(group.id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{group.name}</span>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {group.type}
                        </Badge>
                      </div>
                      <div className="pl-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{group.students.length} students</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedGroup && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Available Students</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStudents ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {availableStudents?.map(student => (
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
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedGroup || selectedStudents.length === 0}
        className="w-full"
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