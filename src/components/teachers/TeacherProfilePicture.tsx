import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TeacherProfilePictureProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
}

export function TeacherProfilePicture({ currentUrl, onUpload }: TeacherProfilePictureProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('teacher-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('teacher-avatars')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={currentUrl || ""} />
        <AvatarFallback className="bg-primary/10">
          {isUploading ? "..." : "PP"}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2">
        <input
          type="file"
          id="profile-picture"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-primary/20 hover:bg-primary/5"
          onClick={() => document.getElementById("profile-picture")?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Picture"}
        </Button>
      </div>
    </div>
  );
}