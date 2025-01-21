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
        className="group py-4 px-4"
        size="lg"
        onClick={onClick}
      >
        <Icon className="h-6 w-6" />
        <span className="text-base font-medium">{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}