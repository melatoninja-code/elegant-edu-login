import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { School, User, Users } from "lucide-react";

interface TeacherCardProps {
  teacher: {
    id: string;
    name: string;
    teacher_groups: Array<{
      id: string;
      name: string;
      type: string;
      studentCount: number;
    }>;
  };
  onGroupSelect: (group: {
    id: string;
    name: string;
    type: string;
    teacherId: string;
    teacherName: string;
  }) => void;
}

export function TeacherCard({ teacher, onGroupSelect }: TeacherCardProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="p-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <School className="h-4 w-4 text-primary" />
          {teacher.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="h-[180px]">
          <div className="space-y-2">
            {teacher.teacher_groups.map(group => (
              <Button
                key={group.id}
                variant="ghost"
                className="w-full flex items-center justify-between p-2 h-auto text-sm hover:bg-muted/50"
                onClick={() => onGroupSelect({
                  id: group.id,
                  name: group.name,
                  type: group.type,
                  teacherId: teacher.id,
                  teacherName: teacher.name
                })}
              >
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium truncate">{group.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {group.studentCount}
                </Badge>
              </Button>
            ))}
            {teacher.teacher_groups.length === 0 && (
              <div className="text-center text-muted-foreground py-2 text-sm">
                No groups
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}