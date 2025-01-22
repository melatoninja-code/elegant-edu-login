import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/types/student";
import { useQuery } from "@tanstack/react-query";
import { File, Download, Upload, Loader2 } from "lucide-react";
import { StudentDocument } from "@/types/student-document";

interface StudentDocumentsProps {
  student: Student;
}

export function StudentDocuments({ student }: StudentDocumentsProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['student-documents', student.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('student_id', student.id);

      if (error) throw error;
      return data as StudentDocument[];
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', student.id);

    try {
      const { error } = await supabase.functions.invoke('upload-student-document', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (document: StudentDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('student-documents')
        .download(document.file_path);

      if (error) throw error;

      // Create a download link
      const link = window.document.createElement('a');
      link.href = URL.createObjectURL(data);
      link.download = document.filename;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 p-4 rounded-lg bg-neutral-light">
      <div className="flex items-center gap-2 text-primary">
        <File className="h-5 w-5 shrink-0" />
        <span className="font-semibold">Documents</span>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : documents?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No documents uploaded yet
          </p>
        ) : (
          documents?.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 rounded-md bg-background border"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(doc.file_size)} • {format(new Date(doc.uploaded_at), "dd MMM yyyy")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(doc)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-10"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}