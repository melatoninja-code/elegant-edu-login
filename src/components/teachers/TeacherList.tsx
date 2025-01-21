import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { TeacherForm } from "./TeacherForm";
import { useToast } from "@/components/ui/use-toast";
import { TeacherListHeader } from "./TeacherListHeader";
import { TeacherTable } from "./TeacherTable";
import { TeacherDetailsDialog } from "./TeacherDetailsDialog";
import { Teacher } from "./types";

export function TeacherList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const { data: userRole, refetch: refetchRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      return profile?.role;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const isAdmin = userRole === "admin";

  const { data: teachers, isLoading, refetch } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("teachers")
        .select("id, name, gender, studies, dorm_room, address, phone_number, profile_picture_url");
      
      if (error) throw error;
      return data as Teacher[];
    },
    enabled: !!userRole,
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

    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
      refetch();
    }
  };

  return (
    <Card>
      <TeacherListHeader
        isAdmin={isAdmin}
        onAddTeacher={() => setIsFormOpen(true)}
      />
      <CardContent>
        <TeacherTable
          teachers={teachers}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onSelectTeacher={setSelectedTeacher}
          onEditTeacher={(teacher) => {
            setEditingTeacher(teacher);
            setIsFormOpen(true);
          }}
          onDeleteTeacher={handleDelete}
        />

        {isFormOpen && (
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
              refetchRole();
            }}
          />
        )}

        <TeacherDetailsDialog
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      </CardContent>
    </Card>
  );
}