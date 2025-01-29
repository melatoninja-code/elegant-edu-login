import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Upload } from "lucide-react";
import { useState } from "react";
import { GradeEntryDialog } from "./GradeEntryDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GradeListHeaderProps {
  isAdmin: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function GradeListHeader({ isAdmin, searchQuery, onSearchChange }: GradeListHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('import-grades', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.successful} grades. ${data.failed} failed.`,
        variant: data.failed > 0 ? "destructive" : "default",
      });

      if (data.errors?.length > 0) {
        console.error('Import errors:', data.errors);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import grades",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="p-4 flex flex-col sm:flex-row gap-4">
      <Input
        placeholder="Search by student name or ID..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      <div className="flex gap-2">
        {isAdmin && (
          <>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Grade
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                className="whitespace-nowrap"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Importing..." : "Import CSV"}
              </Button>
            </div>
          </>
        )}
      </div>
      <GradeEntryDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          setIsDialogOpen(false);
          toast({
            title: "Success",
            description: "Grade added successfully",
          });
        }}
      />
    </div>
  );
}