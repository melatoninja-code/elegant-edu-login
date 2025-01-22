import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Users, School, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function TeacherAssignmentGrid() {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

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
              count
            )
          )
        `);

      if (error) throw error;

      return teachers.map(teacher => ({
        ...teacher,
        teacher_groups: teacher.teacher_groups.map(group => ({
          ...group,
          studentCount: group.teacher_groups_students[0]?.count || 0
        }))
      }));
    }
  });

  // Separate query for fetching students of a specific group
  const { data: groupStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["groupStudents", expandedGroups],
    queryFn: async () => {
      if (expandedGroups.length === 0) return {};

      const { data, error } = await supabase
        .from("teacher_group_student_assignments")
        .select(`
          group_id,
          student:students (
            id,
            name,
            grade_level,
            student_id
          )
        `)
        .in('group_id', expandedGroups);

      if (error) throw error;

      // Transform into a map of groupId -> students[]
      return data.reduce((acc, curr) => {
        if (!acc[curr.group_id]) {
          acc[curr.group_id] = [];
        }
        if (curr.student) {
          acc[curr.group_id].push(curr.student);
        }
        return acc;
      }, {} as Record<string, any[]>);
    },
    enabled: expandedGroups.length > 0
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

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

  if (!teachersWithGroups?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No teachers found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teachersWithGroups.map(teacher => (
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
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-2 hover:bg-muted/50"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{group.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          <Users className="h-3 w-3 mr-1" />
                          {group.studentCount}
                        </Badge>
                        {expandedGroups.includes(group.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                    
                    {expandedGroups.includes(group.id) && (
                      <div className="pl-6 space-y-2">
                        {isLoadingStudents ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                              <Skeleton key={i} className="h-8 w-full" />
                            ))}
                          </div>
                        ) : groupStudents?.[group.id]?.length ? (
                          groupStudents[group.id].map(student => (
                            <Badge
                              key={student.id}
                              variant="outline"
                              className="w-full justify-start gap-2"
                            >
                              <span>{student.name}</span>
                              <span className="text-muted-foreground text-xs">
                                ({student.student_id})
                              </span>
                            </Badge>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-2">
                            No students in this group
                          </div>
                        )}
                      </div>
                    )}
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
    </div>
  );
}