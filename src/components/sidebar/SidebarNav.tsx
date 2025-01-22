import { useNavigate } from "react-router-dom"
import { Users, BookOpen, Calendar, Bell, Wallet, MessageSquare, UserCheck, GraduationCap, Home, School } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { SidebarNavItem } from "./SidebarNavItem"

const menuItems = [
  {
    title: "Home",
    icon: Home,
    path: "/dashboard",
    description: "Dashboard overview",
  },
  {
    title: "Studies",
    icon: GraduationCap,
    path: "/studies",
    description: "Course materials & resources",
  },
  {
    title: "Forum",
    icon: MessageSquare,
    path: "/forum",
    description: "Discussions & announcements",
  },
  {
    title: "Attendance",
    icon: UserCheck,
    path: "/attendance",
    description: "Track & manage attendance",
  },
  {
    title: "Students",
    icon: Users,
    path: "/students",
    description: "Track progress & attendance",
  },
  {
    title: "Teachers",
    icon: BookOpen,
    path: "/teachers",
    description: "Performance & schedules",
  },
  {
    title: "Classrooms",
    icon: School,
    path: "/classrooms",
    description: "Manage school classrooms",
  },
  {
    title: "Calendar",
    icon: Calendar,
    path: "/calendar",
    description: "Events & permissions",
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/notifications",
    description: "Alerts & reminders",
  },
  {
    title: "Finance",
    icon: Wallet,
    path: "/finance",
    description: "Expenses & savings",
  },
]

export function SidebarNav() {
  const navigate = useNavigate()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-base px-4 py-2">Main Menu</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-3">
          {menuItems.map((item) => (
            <SidebarNavItem
              key={item.title}
              {...item}
              onClick={() => navigate(item.path)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}