import { SidebarHeader as Header } from "@/components/ui/sidebar"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

export function SidebarHeader() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <Header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </Header>
  )
}