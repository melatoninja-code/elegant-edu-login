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
        size="lg"
        onClick={onClick}
      >
        <Icon className="h-5 w-5" />
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}