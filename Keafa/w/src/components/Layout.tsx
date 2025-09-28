import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
// --- THIS IS THE ONLY LINE THAT HAS BEEN CHANGED ---
import { AppSidebar } from "./AppSidebar"; 

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-card flex items-center px-6 shadow-sm shrink-0">
          <SidebarTrigger className="text-primary" />
          <div className="ml-4">
            <h1 className="font-serif text-xl font-bold text-primary">Keafa Design</h1>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;