import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClassroomForm } from "@/components/classrooms/ClassroomForm"
import { supabase } from "@/integrations/supabase/client"

export default function Classrooms() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data: classrooms, isLoading } = useQuery({
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
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Classroom
            </Button>
          </div>
          <div className="container mx-auto py-6 px-4 md:px-6">
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classrooms?.map((classroom) => (
                  <Card key={classroom.id}>
                    <CardHeader>
                      <CardTitle>{classroom.name}</CardTitle>
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
              <ClassroomForm />
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  )
}