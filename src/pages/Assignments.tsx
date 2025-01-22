import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TeacherAssignmentGrid } from "@/components/assignments/TeacherAssignmentGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import { TeacherGroupForm } from "@/components/assignments/TeacherGroupForm";

export default function Assignments() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 p-6 border-b">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Teacher Assignments</h1>
          </div>
          <div className="container mx-auto py-6 px-4 md:px-6">
            <Tabs defaultValue="grid" className="space-y-6">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="form">Batch Assign</TabsTrigger>
                <TabsTrigger value="groups">Create Group</TabsTrigger>
              </TabsList>
              <TabsContent value="grid">
                <TeacherAssignmentGrid />
              </TabsContent>
              <TabsContent value="form">
                <AssignmentForm />
              </TabsContent>
              <TabsContent value="groups">
                <TeacherGroupForm />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}