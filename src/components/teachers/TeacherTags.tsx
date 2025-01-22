import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Tags, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface TeacherTagsProps {
  teacherId: string;
  isAdmin?: boolean;
}

export function TeacherTags({ teacherId, isAdmin }: TeacherTagsProps) {
  const [newTag, setNewTag] = useState("");
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
    if (!newTag.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase.from("teacher_tags").insert({
        teacher_id: teacherId,
        tag: newTag.trim(),
        created_by: session.user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tag added successfully",
      });

      setNewTag("");
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

  const getRandomColor = (tag: string) => {
    const colors = [
      "bg-red-100 text-red-800 hover:bg-red-200",
      "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "bg-green-100 text-green-800 hover:bg-green-200",
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "bg-pink-100 text-pink-800 hover:bg-pink-200",
      "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      "bg-gray-100 text-gray-800 hover:bg-gray-200",
    ];
    
    // Use the tag string to generate a consistent index
    const index = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

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
            className={`${getRandomColor(tag.tag)} animate-fadeIn`}
          >
            {tag.tag}
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
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter a new tag"
            className="w-[200px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTag}
            disabled={!newTag.trim()}
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