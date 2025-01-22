import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, Tags, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type TeacherTag = 
  | "head_teacher"
  | "senior_teacher"
  | "junior_teacher"
  | "substitute_teacher"
  | "intern"
  | "math_teacher"
  | "science_teacher"
  | "english_teacher"
  | "history_teacher"
  | "art_teacher"
  | "music_teacher"
  | "pe_teacher"
  | "homeroom_teacher"
  | "curriculum_coordinator"
  | "student_counselor";

const TAG_COLORS: { [key in TeacherTag]: string } = {
  head_teacher: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  senior_teacher: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  junior_teacher: "bg-green-100 text-green-800 hover:bg-green-200",
  substitute_teacher: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  intern: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  math_teacher: "bg-red-100 text-red-800 hover:bg-red-200",
  science_teacher: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  english_teacher: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  history_teacher: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  art_teacher: "bg-teal-100 text-teal-800 hover:bg-teal-200",
  music_teacher: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
  pe_teacher: "bg-lime-100 text-lime-800 hover:bg-lime-200",
  homeroom_teacher: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  curriculum_coordinator: "bg-violet-100 text-violet-800 hover:bg-violet-200",
  student_counselor: "bg-rose-100 text-rose-800 hover:bg-rose-200",
};

interface TeacherTagsProps {
  teacherId: string;
  isAdmin?: boolean;
}

export function TeacherTags({ teacherId, isAdmin }: TeacherTagsProps) {
  const [selectedTag, setSelectedTag] = useState<TeacherTag | "">("");
  const { toast } = useToast();

  const { data: tags, refetch: refetchTags } = useQuery({
    queryKey: ["teacherTags", teacherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_tags")
        .select("*")
        .eq("teacher_id", teacherId);

      if (error) throw error;
      return data;
    },
  });

  const handleAddTag = async () => {
    if (!selectedTag) return;

    try {
      // Get the current user's ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase.from("teacher_tags").insert({
        teacher_id: teacherId,
        tag: selectedTag,
        created_by: session.user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tag added successfully",
      });

      setSelectedTag("");
      refetchTags();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add tag",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from("teacher_tags")
        .delete()
        .eq("id", tagId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tag removed successfully",
      });

      refetchTags();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove tag",
        variant: "destructive",
      });
    }
  };

  const formatTagName = (tag: string) =>
    tag
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tags className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">Teacher Tags</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className={`${TAG_COLORS[tag.tag as TeacherTag]} animate-fadeIn`}
          >
            {formatTagName(tag.tag)}
            {isAdmin && (
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:text-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        {(!tags || tags.length === 0) && (
          <span className="text-sm text-muted-foreground">No tags assigned</span>
        )}
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2">
          <Select
            value={selectedTag}
            onValueChange={(value) => setSelectedTag(value as TeacherTag)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TAG_COLORS) as TeacherTag[]).map((tag) => (
                <SelectItem key={tag} value={tag}>
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    <span>{formatTagName(tag)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTag}
            disabled={!selectedTag}
            className="h-10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Tag
          </Button>
        </div>
      )}
    </div>
  );
}