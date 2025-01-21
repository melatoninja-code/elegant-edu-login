import { Calendar, Users, BookOpen, Bell, Wallet } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.description}
                    className="group"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}