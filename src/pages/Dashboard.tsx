import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Users,
  CalendarDays,
  BookOpen,
  Clock,
} from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Dashboard() {
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/')
        return
      }

      // Fetch user profile data
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('id', session.user.id)
        .single()

      if (!error && profileData) {
        setUserProfile(profileData)
      }
    }
    checkAuth()
  }, [navigate])

  const stats = [
    {
      title: "Total Students",
      value: "1,234",
      description: "Active students",
      icon: Users,
    },
    {
      title: "Teachers",
      value: "45",
      description: "Active teachers",
      icon: BookOpen,
    },
    {
      title: "Attendance Rate",
      value: "95%",
      description: "Last 30 days",
      icon: Clock,
    },
    {
      title: "Events",
      value: "12",
      description: "Upcoming events",
      icon: CalendarDays,
    },
  ]

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <div className="flex items-center justify-between gap-4 p-6 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Dayah School System</h1>
            </div>
            {userProfile && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    {userProfile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{userProfile.email}</p>
                  <p className="text-muted-foreground capitalize">{userProfile.role}</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="grid gap-6">
              <section>
                <h2 className="text-3xl font-bold mb-6">Welcome back!</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat) => (
                    <Card key={stat.title}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}