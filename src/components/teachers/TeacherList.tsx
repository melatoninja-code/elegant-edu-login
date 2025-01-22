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

  const { data: userRole, error: roleError } = useQuery({
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

  // Then fetch teachers data
  const { data: teachers, isLoading, error: teachersError, refetch } = useQuery({
    queryKey: ["teachers", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("teachers")
        .select("*");
      
      if (error) throw error;
      return data as Teacher[];
    },
    enabled: !!session?.user?.id,
  });

  // Filter teachers based on search query
  const filteredTeachers = teachers?.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      const { error } = await supabase.from("teachers").delete().eq("id", id);
      if (error) throw error;
      
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

  if (roleError || teachersError) {
    return (
      <Alert variant="destructive" className="animate-fadeIn">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {roleError?.message || teachersError?.message || "An error occurred while loading data"}
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
            }}
          />
        )}

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