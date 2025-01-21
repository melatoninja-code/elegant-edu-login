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
import { Edit, Trash, UserPlus } from "lucide-react";
import { useState } from "react";
import { TeacherForm } from "./TeacherForm";
import { useToast } from "@/components/ui/use-toast";

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

  const { data: teachers, refetch } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*");
      if (error) throw error;
      return data as Teacher[];
    },
  });

  const handleDelete = async (id: string) => {
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teachers</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <UserPlus className="mr-2" />
          Add Teacher
        </Button>
      </div>

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Studies</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Dorm Room</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers?.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.name}</TableCell>
              <TableCell className="capitalize">{teacher.gender}</TableCell>
              <TableCell>{teacher.phone_number}</TableCell>
              <TableCell>{teacher.studies}</TableCell>
              <TableCell>{teacher.address}</TableCell>
              <TableCell>{teacher.dorm_room || "-"}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}