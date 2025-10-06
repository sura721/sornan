import { Users, Home, Search, Bell, LogOut, Settings } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// This structure is final and correct.
const navigationItems = {
  main: [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "View Orders", url: "/orders", icon: Users },
    { title: "Search Orders", url: "/search", icon: Search },
  ]
};

export function AppSidebar() {
  const { logout, currentUser, notificationCount } = useData();
  const isMasterUser = currentUser?.username === 'admin';

  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarContent className="bg-card border-r flex flex-col">
        <div className="flex-grow">
    <Link to={'/'} >
      <img src="\logo2.png" alt="keafa logo" />
    </Link>

          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.main.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={({ isActive }) => cn( "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all font-medium", !isActive && "text-muted-foreground hover:bg-accent", isActive && "bg-primary text-primary-foreground hover:bg-primary/90" )}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
           
                {isMasterUser && (
                   <SidebarMenuItem>
                     <SidebarMenuButton asChild>
                       <NavLink to="/settings" end className={({ isActive }) => cn( "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all font-medium", !isActive && "text-muted-foreground hover:bg-accent", isActive && "bg-primary text-primary-foreground hover:bg-primary/90" )}>
                         <Settings className="w-4 h-4" />
                         <span>Settings</span>
                       </NavLink>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="p-4 border-t">
            <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700">
                <LogOut className="w-4 h-4 mr-3" />
                <span>Logout</span>
            </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}