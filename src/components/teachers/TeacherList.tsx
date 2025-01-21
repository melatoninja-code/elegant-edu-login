import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { TeacherForm } from "./TeacherForm";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Teacher {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  dorm_room: string | null;
  studies: string;
  gender: string;
}

export function TeacherList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
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
  });

  const isAdmin = userRole === "admin";

  const { data: teachers, isLoading, refetch } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*");
      if (error) throw error;
      return data as Teacher[];
    },
  });

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teachers'
        },
        () => {
          refetch();
          refetchRole(); // Also refetch the role to ensure admin status is maintained
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, refetchRole]);

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">Teachers</CardTitle>
        {isAdmin && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2" />
            Add Teacher
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !teachers?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No teachers found.
            {isAdmin && " Add one to get started."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="hidden md:table-cell">Gender</TableHead>
                  {isAdmin && (
                    <>
                      <TableHead>Phone</TableHead>
                      <TableHead className="hidden lg:table-cell">Address</TableHead>
                    </>
                  )}
                  <TableHead className="hidden md:table-cell">Studies</TableHead>
                  <TableHead className="hidden lg:table-cell">Dorm Room</TableHead>
                  {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers?.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell className="hidden md:table-cell capitalize">
                      {teacher.gender}
                    </TableCell>
                    {isAdmin && (
                      <>
                        <TableCell>{teacher.phone_number}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {teacher.address}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="hidden md:table-cell">
                      {teacher.studies}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {teacher.dorm_room || "-"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTeacher(teacher);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

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
              refetchRole(); // Refetch role when form closes
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}