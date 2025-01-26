import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { TeacherForm } from "./TeacherForm";
import { useToast } from "@/hooks/use-toast";
import { TeacherListHeader } from "./TeacherListHeader";
import { TeacherTable } from "./TeacherTable";
import { TeacherDetailsDialog } from "./TeacherDetailsDialog";
import { Teacher } from "./types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TeacherList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // First, get the session and user role
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      
      return profile?.role || null;
    },
    enabled: !!session?.user?.id,
  });

  const isAdmin = userRole === "admin";

  // Fetch teachers and their tags
  const { data: teachersWithTags, isLoading, error: teachersError, refetch } = useQuery({
    queryKey: ["teachers", "tags", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");

      const { data: teachers, error: teachersError } = await supabase
        .from("teachers")
        .select("*");
      
      if (teachersError) throw teachersError;

      const { data: tags, error: tagsError } = await supabase
        .from("teacher_tags")
        .select("*");

      if (tagsError) throw tagsError;

      // Combine teachers with their tags
      return teachers?.map(teacher => ({
        ...teacher,
        email: teacher.account_email || teacher.email,
        tags: tags.filter(tag => tag.teacher_id === teacher.id).map(t => t.tag)
      })) || [];
    },
    enabled: !!session?.user?.id,
  });

  const filteredTeachers = teachersWithTags?.filter(teacher => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = teacher.name.toLowerCase().includes(searchLower);
    const tagMatch = teacher.tags.some(tag => 
      tag.toLowerCase().includes(searchLower)
    );
    return nameMatch || tagMatch;
  });

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only administrators can delete teachers",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, get all teacher groups
      const { data: teacherGroups, error: groupsQueryError } = await supabase
        .from("teacher_groups")
        .select("id")
        .eq("teacher_id", id);
      
      if (groupsQueryError) throw groupsQueryError;

      // Delete all student assignments for these groups
      if (teacherGroups && teacherGroups.length > 0) {
        const groupIds = teacherGroups.map(g => g.id);
        const { error: groupAssignmentsError } = await supabase
          .from("teacher_group_student_assignments")
          .delete()
          .in("group_id", groupIds);

        if (groupAssignmentsError) throw groupAssignmentsError;
      }

      // Delete teacher groups
      const { error: groupsError } = await supabase
        .from("teacher_groups")
        .delete()
        .eq("teacher_id", id);

      if (groupsError) throw groupsError;

      // Delete teacher student assignments
      const { error: studentAssignmentsError } = await supabase
        .from("teacher_student_assignments")
        .delete()
        .eq("teacher_id", id);

      if (studentAssignmentsError) throw studentAssignmentsError;

      // Delete teacher tags
      const { error: tagsError } = await supabase
        .from("teacher_tags")
        .delete()
        .eq("teacher_id", id);

      if (tagsError) throw tagsError;

      // Finally, delete the teacher
      const { error: teacherError } = await supabase
        .from("teachers")
        .delete()
        .eq("id", id);

      if (teacherError) throw teacherError;
      
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete teacher",
        variant: "destructive",
      });
    }
  };

  if (teachersError) {
    return (
      <Alert variant="destructive" className="animate-fadeIn">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {teachersError.message || "An error occurred while loading data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="animate-fadeIn shadow-lg border-primary/20">
      <TeacherListHeader
        isAdmin={isAdmin}
        onAddTeacher={() => setIsFormOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CardContent>
        <TeacherTable
          teachers={filteredTeachers}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onSelectTeacher={(teacher) => {
            setSelectedTeacher(teacher);
          }}
          onEditTeacher={(teacher) => {
            setEditingTeacher(teacher);
            setIsFormOpen(true);
          }}
          onDeleteTeacher={handleDelete}
        />

        <TeacherForm
          teacher={editingTeacher}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTeacher(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingTeacher(null);
            refetch();
          }}
          open={isFormOpen}
        />

        <TeacherDetailsDialog
          teacher={selectedTeacher}
          onClose={() => {
            setSelectedTeacher(null);
          }}
          isAdmin={isAdmin}
        />
      </CardContent>
    </Card>
  );
}