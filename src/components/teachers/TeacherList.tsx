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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Teacher {
  id: string;
  name: string;
  gender: string;
  studies: string;
  dorm_room: string | null;
  address: string;
  phone_number: string;
  profile_picture_url?: string | null;
}

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
          refetchRole();
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
                  <TableHead className="hidden md:table-cell">Studies</TableHead>
                  <TableHead className="hidden lg:table-cell">Dorm Room</TableHead>
                  <TableHead className="hidden lg:table-cell">Address</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers?.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setSelectedTeacher(teacher)}
                    >
                      {teacher.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell capitalize">
                      {teacher.gender}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {teacher.studies}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {teacher.dorm_room || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {teacher.address}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {teacher.phone_number}
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
              refetchRole();
            }}
          />
        )}

        <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Teacher Details</DialogTitle>
            </DialogHeader>
            {selectedTeacher && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedTeacher.profile_picture_url || ''} alt={selectedTeacher.name} />
                    <AvatarFallback>{selectedTeacher.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Name:</span>
                  <span className="col-span-3">{selectedTeacher.name}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Gender:</span>
                  <span className="col-span-3 capitalize">{selectedTeacher.gender}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Studies:</span>
                  <span className="col-span-3">{selectedTeacher.studies}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Dorm:</span>
                  <span className="col-span-3">{selectedTeacher.dorm_room || '-'}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Address:</span>
                  <span className="col-span-3">{selectedTeacher.address}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Phone:</span>
                  <span className="col-span-3">{selectedTeacher.phone_number}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}