import { AppSidebar } from "@/components/AppSidebar";

interface AccessRestrictionProps {
  message: string;
}

export function AccessRestriction({ message }: AccessRestrictionProps) {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <h2 className="text-lg font-semibold text-destructive">Access Restricted</h2>
            <p className="mt-2">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}