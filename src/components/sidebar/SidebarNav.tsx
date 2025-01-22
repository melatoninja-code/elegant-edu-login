import { Home, Users, GraduationCap, School, CalendarDays } from "lucide-react";

export const items = [
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
