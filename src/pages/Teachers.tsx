import { TeacherList } from "@/components/teachers/TeacherList"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default function Teachers() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 p-6 border-b">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Teachers</h1>
          </div>
          <div className="container mx-auto py-6 px-4 md:px-6">
            <TeacherList />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}