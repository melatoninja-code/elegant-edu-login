import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar"
import SidebarNav from "./sidebar/SidebarNav"
import { SidebarHeader } from "./sidebar/SidebarHeader"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
    </Sidebar>
  )
}