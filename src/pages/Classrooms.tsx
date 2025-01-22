import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClassroomForm } from "@/components/classrooms/ClassroomForm"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function Classrooms() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      return profile
    },
  })

  const { data: classrooms, isLoading, refetch } = useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
  })

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("classrooms")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Classroom has been deleted successfully.",
      })
      refetch()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete classroom. Please try again.",
      })
    }
  }

  const isAdmin = userProfile?.role === "admin"

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Classrooms</h1>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Classroom
              </Button>
            )}
          </div>
          <div className="container mx-auto py-6 px-4 md:px-6">
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classrooms?.map((classroom) => (
                  <Card key={classroom.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle>{classroom.name}</CardTitle>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(classroom.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Room: {classroom.room_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Capacity: {classroom.capacity} students
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: {classroom.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Location: Floor {classroom.floor}, {classroom.building}
                        </p>
                        {classroom.description && (
                          <p className="text-sm text-muted-foreground">
                            {classroom.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Classroom</DialogTitle>
              </DialogHeader>
              <ClassroomForm onSuccess={() => {
                setShowCreateDialog(false)
                refetch()
              }} />
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  )
}