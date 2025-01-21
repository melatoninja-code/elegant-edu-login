import { SidebarHeader as Header } from "@/components/ui/sidebar"
import { LogOut, Building2 } from "lucide-react"
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
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Building2 className="h-8 w-8 text-primary" />
          <span className="font-semibold text-lg">Dayah</span>
        </button>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </Header>
  )
}