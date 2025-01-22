import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupDetailsDialog } from "./GroupDetailsDialog";
import { TeacherCard } from "./TeacherCard";

export function TeacherAssignmentGrid() {
  const [selectedGroup, setSelectedGroup] = useState<{
    id: string;
    name: string;
    type: string;
    teacherId: string;
    teacherName: string;
  } | null>(null);

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

  // Separate query for fetching students of the selected group
  const { data: groupStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["groupStudents", selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup?.id) return null;

      const { data, error } = await supabase
        .from("teacher_group_student_assignments")
        .select(`
          student:students (
            id,
            name,
            grade_level,
            student_id
          )
        `)
        .eq('group_id', selectedGroup.id);

      if (error) throw error;

      return data.map(d => d.student);
    },
    enabled: !!selectedGroup?.id
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-[240px]" />
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
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {teachersWithGroups.map(teacher => (
          <TeacherCard
            key={teacher.id}
            teacher={teacher}
            onGroupSelect={setSelectedGroup}
          />
        ))}
      </div>

      <GroupDetailsDialog
        group={selectedGroup ? {
          id: selectedGroup.id,
          name: selectedGroup.name,
          type: selectedGroup.type
        } : null}
        teacher={selectedGroup ? {
          id: selectedGroup.teacherId,
          name: selectedGroup.teacherName
        } : null}
        students={groupStudents}
        isLoading={isLoadingStudents}
        onClose={() => setSelectedGroup(null)}
      />
    </>
  );
}