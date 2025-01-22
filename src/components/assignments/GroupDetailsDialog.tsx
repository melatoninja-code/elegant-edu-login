import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { School, User, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupDetailsDialogProps {
  group: {
    id: string;
    name: string;
    type: string;
  } | null;
  teacher: {
    id: string;
    name: string;
  } | null;
  students: Array<{
    id: string;
    name: string;
    grade_level: number;
    student_id: string;
  }> | null;
  isLoading: boolean;
  onClose: () => void;
}

export function GroupDetailsDialog({ 
  group, 
  teacher,
  students, 
  isLoading,
  onClose 
}: GroupDetailsDialogProps) {
  if (!group) return null;

  return (
    <Dialog open={!!group} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <School className="h-5 w-5 text-primary" />
            Group Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4">
          <div className="space-y-6">
            {/* Group Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {group.name}
              </h3>
              <Badge variant="secondary" className="capitalize">
                {group.type}
              </Badge>
            </div>

            {/* Teacher Info */}
            {teacher && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium text-primary">Teacher</h4>
                <p>{teacher.name}</p>
              </div>
            )}

            {/* Students List */}
            <div className="space-y-2">
              <h4 className="font-medium text-primary flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Students
              </h4>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : students?.length ? (
                  <div className="space-y-2">
                    {students.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                      >
                        <span className="font-medium">{student.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Grade {student.grade_level}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {student.student_id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No students in this group
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}