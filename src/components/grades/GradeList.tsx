import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { GradeTable } from "./GradeTable";
import { GradeListHeader } from "./GradeListHeader";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function GradeList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  const { data: gradesData, isLoading, error } = useQuery({
    queryKey: ["grades", currentPage, searchQuery, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");

      let query = supabase
        .from("grades")
        .select(`
          *,
          student:students(name, student_id),
          teacher:teachers(name)
        `, { count: "exact" });

      // Apply search filter if query exists
      if (searchQuery) {
        query = query.or(`student.name.ilike.%${searchQuery}%,student.student_id.ilike.%${searchQuery}%`.split(','));
      }

      // Get total count first
      const { count } = await query;
      const totalCount = count || 0;

      // Calculate pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      // Fetch the actual data
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        grades: data,
        totalCount,
      };
    },
    enabled: !!session?.user?.id,
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || "An error occurred while loading grades"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="animate-fadeIn shadow-lg border-primary/20">
      <GradeListHeader
        isAdmin={isAdmin}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CardContent>
        <GradeTable
          grades={gradesData?.grades || []}
          isLoading={isLoading}
          isAdmin={isAdmin}
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil((gradesData?.totalCount || 0) / pageSize))}
          onPageChange={setCurrentPage}
        />
      </CardContent>
    </Card>
  );
}