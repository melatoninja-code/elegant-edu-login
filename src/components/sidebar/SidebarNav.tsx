import { useNavigate } from "react-router-dom"
import { Users, BookOpen, Calendar, Bell, Wallet } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { SidebarNavItem } from "./SidebarNavItem"

const menuItems = [
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
      <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
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