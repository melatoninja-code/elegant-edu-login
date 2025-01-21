import { LucideIcon } from "lucide-react"
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface SidebarNavItemProps {
  icon: LucideIcon
  title: string
  description: string
  path: string
  onClick?: () => void
}

export function SidebarNavItem({ icon: Icon, title, description, onClick }: SidebarNavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={description}
        className="group"
        onClick={onClick}
      >
        <Icon className="h-4 w-4" />
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}