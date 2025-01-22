import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { StudentForm } from "./StudentForm";
import { useToast } from "@/hooks/use-toast";
import { StudentListHeader } from "./StudentListHeader";
import { StudentTable } from "./StudentTable";
import { Student } from "@/types/student";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function StudentList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
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

  // Fetch students with pagination and search
  const { data: studentsData, isLoading, error: studentsError, refetch } = useQuery({
    queryKey: ["students", currentPage, searchQuery, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");

      let query = supabase
        .from("students")
        .select("*", { count: "exact" });

      // Apply search filter if query exists
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,student_id.ilike.%${searchQuery}%`);
      }

      // Get total count first
      const { count } = await query;
      const totalCount = count || 0;

      // Calculate the correct page and offset
      const safeCurrentPage = Math.min(
        currentPage,
        Math.max(1, Math.ceil(totalCount / pageSize))
      );
      
      // If current page changed, update it
      if (safeCurrentPage !== currentPage) {
        setCurrentPage(safeCurrentPage);
      }

      // Apply pagination with safe values
      const from = (safeCurrentPage - 1) * pageSize;
      const to = Math.min(from + pageSize - 1, totalCount);

      // Fetch the actual data
      const { data, error } = await query
        .order('name')
        .range(from, to);

      if (error) throw error;

      return {
        students: data,
        totalCount,
      };
    },
    enabled: !!session?.user?.id,
  });

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only administrators can delete students",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  if (studentsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {studentsError.message || "An error occurred while loading data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="animate-fadeIn shadow-lg border-primary/20">
      <StudentListHeader
        isAdmin={isAdmin}
        onAddStudent={() => {
          setEditingStudent(null);
          setIsFormOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CardContent>
        <StudentTable
          students={studentsData?.students || []}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onEditStudent={(student) => {
            setEditingStudent(student);
            setIsFormOpen(true);
          }}
          onDeleteStudent={handleDelete}
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil((studentsData?.totalCount || 0) / pageSize))}
          onPageChange={setCurrentPage}
        />

        <StudentForm
          student={editingStudent}
          onClose={() => {
            setIsFormOpen(false);
            setEditingStudent(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingStudent(null);
            refetch();
          }}
          open={isFormOpen}
        />
      </CardContent>
    </Card>
  );
}
