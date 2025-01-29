import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GradeList } from "@/components/grades/GradeList";
import { GradeAnalytics } from "@/components/grades/GradeAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar, List } from "lucide-react";

export default function Grades() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto bg-neutral-light/30">
          <div className="flex items-center gap-4 p-6 border-b bg-white">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold text-primary-dark">Grades</h1>
          </div>
          <div className="container mx-auto py-6 px-4 md:px-6">
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Grade List</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <ChartBar className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="space-y-4">
                <GradeList />
              </TabsContent>
              <TabsContent value="analytics" className="space-y-4">
                <GradeAnalytics />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}