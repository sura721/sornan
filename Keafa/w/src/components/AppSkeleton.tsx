// src/components/AppSkeleton.tsx

import { Loader2 } from "lucide-react";

const AppSkeleton = () => {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Skeleton Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-muted/40 p-6 space-y-8 animate-pulse">
        {/* Skeleton Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-muted"></div>
          <div className="space-y-1">
            <div className="h-4 w-24 rounded bg-muted"></div>
            <div className="h-3 w-32 rounded bg-muted"></div>
          </div>
        </div>
        
        {/* Skeleton Navigation */}
        <div className="space-y-4">
          <div className="h-8 w-full rounded-md bg-muted"></div>
          <div className="h-8 w-full rounded-md bg-muted"></div>
          <div className="h-8 w-full rounded-md bg-muted"></div>
          <div className="h-8 w-full rounded-md bg-muted"></div>
        </div>

        {/* Skeleton Logout */}
        <div className="mt-auto h-8 w-full rounded-md bg-muted"></div>
      </div>

      {/* Skeleton Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Skeleton Header */}
        <div className="flex items-center h-16 border-b px-6 bg-muted/40 animate-pulse">
          <div className="h-6 w-32 rounded-md bg-muted"></div>
        </div>
        
        {/* Skeleton Content Area with Spinner */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg font-semibold text-muted-foreground">
                Authenticating session...
            </p>
            <p className="text-sm text-muted-foreground">
                Please wait a moment.
            </p>
        </main>
      </div>
    </div>
  );
};

export default AppSkeleton;  