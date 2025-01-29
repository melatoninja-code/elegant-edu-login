import { LayoutDashboard, Users, GraduationCap, School, CalendarDays, BookOpen, UserPlus, GraduationCap as GradeIcon } from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarMenu } from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    description: "Go to Dashboard",
  },
  {
    title: "Teachers",
    path: "/teachers",
    icon: Users,
    description: "Manage Teachers",
  },
  {
    title: "Students",
    path: "/students",
    icon: GraduationCap,
    description: "Manage Students",
  },
  {
    title: "Assignments",
    path: "/assignments",
    icon: UserPlus,
    description: "Assign Students to Teachers",
  },
  {
    title: "Grades",
    path: "/grades",
    icon: GradeIcon,
    description: "Manage Student Grades",
  },
  {
    title: "Classrooms",
    path: "/classrooms",
    icon: School,
    description: "Manage Classrooms",
  },
  {
    title: "Calendar",
    path: "/calendar",
    icon: CalendarDays,
    description: "View Calendar",
  },
  {
    title: "Bookings",
    path: "/bookings",
    icon: BookOpen,
    description: "Manage Bookings",
  },
] as const;

export default function SidebarNav() {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarNavItem
          key={item.path}
          icon={item.icon}
          title={item.title}
          path={item.path}
          description={item.description}
        />
      ))}
    </SidebarMenu>
  );
}