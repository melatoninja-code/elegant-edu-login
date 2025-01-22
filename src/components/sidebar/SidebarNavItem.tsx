import { LucideIcon } from "lucide-react"
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"

interface SidebarNavItemProps {
  icon: LucideIcon
  title: string
  description: string
  path: string
}

export function SidebarNavItem({ icon: Icon, title, path }: SidebarNavItemProps) {
  const navigate = useNavigate();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => navigate(path)}
        className="group py-4 px-4"
        size="lg"
      >
        <Icon className="h-6 w-6" />
        <span className="text-base font-medium">{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}