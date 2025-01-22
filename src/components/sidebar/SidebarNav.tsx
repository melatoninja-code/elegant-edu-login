import { Home, Users, GraduationCap, School, CalendarDays } from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarMenu } from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Teachers",
    href: "/teachers",
    icon: Users,
  },
  {
    title: "Students",
    href: "/students",
    icon: GraduationCap,
  },
  {
    title: "Classrooms",
    href: "/classrooms",
    icon: School,
  },
  {
    title: "Bookings",
    href: "/bookings",
    icon: CalendarDays,
  },
] as const;

export default function SidebarNav() {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarNavItem
          key={item.href}
          icon={item.icon}
          title={item.title}
          path={item.href}
          description={`Go to ${item.title}`}
        />
      ))}
    </SidebarMenu>
  );
}