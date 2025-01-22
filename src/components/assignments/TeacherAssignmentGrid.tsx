import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Users, School } from "lucide-react";

export function TeacherAssignmentGrid() {
  const { data: teachersWithGroups, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted" />
            <CardContent className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teachersWithGroups?.map(teacher => (
        <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
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
                  <div key={group.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{group.name}</span>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {group.type}
                      </Badge>
                    </div>
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{group.students.length} students</span>
                      </div>
                      <div className="space-y-1">
                        {group.students.map(student => (
                          <Badge
                            key={student.id}
                            variant="outline"
                            className="w-full justify-start"
                          >
                            {student.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {teacher.teacher_groups.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No groups assigned
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
      {teachersWithGroups?.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground py-8">
          No teachers found
        </div>
      )}
    </div>
  );
}