import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.string(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
  dorm_room: z.string().optional(),
  studies: z.string().min(2, "Studies must be at least 2 characters"),
});

interface TeacherFormProps {
  teacher?: {
    id: string;
    name: string;
    gender: string;
    address: string;
    phone_number: string;
    dorm_room: string | null;
    studies: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function TeacherForm({ teacher, onClose, onSuccess }: TeacherFormProps) {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getCurrentUser();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teacher?.name || "",
      gender: teacher?.gender || "",
      address: teacher?.address || "",
      phone_number: teacher?.phone_number || "",
      dorm_room: teacher?.dorm_room || "",
      studies: teacher?.studies || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    try {
      const submissionData = {
        name: values.name,
        gender: values.gender,
        address: values.address,
        phone_number: values.phone_number,
        studies: values.studies,
        dorm_room: values.dorm_room || null,
        created_by: userId,
      };

      if (teacher?.id) {
        const { error } = await supabase
          .from("teachers")
          .update(submissionData)
          .eq("id", teacher.id);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Teacher updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("teachers")
          .insert([submissionData]);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Teacher added successfully",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm z-50">
      <Card className="w-full max-w-lg bg-white/95 shadow-xl border-primary/20 animate-fadeIn">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5 rounded-t-lg">
          <CardTitle className="text-xl font-semibold text-primary-dark">
            {teacher ? "Edit Teacher" : "Add Teacher"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6 pb-4 px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-primary/20 focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-primary/20 focus-visible:ring-primary bg-white">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-primary/20 shadow-lg z-[100]">
                        <SelectItem value="male" className="hover:bg-primary/5 focus:bg-primary/5">Male</SelectItem>
                        <SelectItem value="female" className="hover:bg-primary/5 focus:bg-primary/5">Female</SelectItem>
                        <SelectItem value="other" className="hover:bg-primary/5 focus:bg-primary/5">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="border-primary/20 focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Studies</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-primary/20 focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Address</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-primary/20 focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dorm_room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Dorm Room (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-primary/20 focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-primary/10">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark"
                >
                  {teacher ? "Update Teacher" : "Add Teacher"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}