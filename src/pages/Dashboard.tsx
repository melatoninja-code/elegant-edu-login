import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  CalendarDays,
  BookOpen,
  Clock,
  LogOut,
  Bell,
  Wallet,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
  ];

  const quickActions = [
    {
      title: "Student Management",
      description: "Track progress & attendance",
      icon: Users,
      path: "/students",
    },
    {
      title: "Teacher Tracking",
      description: "Performance & schedules",
      icon: BookOpen,
      path: "/teachers",
    },
    {
      title: "Calendar",
      description: "Events & permissions",
      icon: CalendarDays,
      path: "/calendar",
    },
    {
      title: "Notifications",
      description: "Alerts & reminders",
      icon: Bell,
      path: "/notifications",
    },
    {
      title: "Finance",
      description: "Expenses & savings",
      icon: Wallet,
      path: "/finance",
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">Dayah School System</h1>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
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

              <section>
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <Card
                      key={action.title}
                      className="hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(action.path)}
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <action.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{action.title}</CardTitle>
                            <CardDescription>{action.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}