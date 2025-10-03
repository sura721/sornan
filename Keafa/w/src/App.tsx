import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import AddIndividual from "@/pages/AddIndividual";
import EditIndividual from "@/pages/EditIndividual";
import AddFamily from "@/pages/AddFamily";
import EditFamily from "@/pages/EditFamily";
import Orders from "@/pages/Orders";
import Search from "@/pages/Search";
import Notifications from "@/pages/Notifications";
import Login from "@/pages/Login";
import Settings from "@/pages/Settings";
import { DataProvider, useData } from "@/contexts/DataContext";

// --- 1. IMPORT THE NEW SKELETON COMPONENT ---
import AppSkeleton from "@/components/AppSkeleton";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { isAuthenticated, isLoading } = useData();

  if (isLoading) {
    // --- 2. USE THE NEW SKELETON INSTEAD OF THE SIMPLE SPINNER ---
    return <AppSkeleton />;
  }

  return isAuthenticated ? (
    <SidebarProvider>
      <Layout>
        <Outlet />
      </Layout>
    </SidebarProvider>
  ) : (
    <Navigate to="/login" replace />
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/search" element={<Search />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/add-individual" element={<AddIndividual />} />
        <Route path="/edit-individual/:id" element={<EditIndividual />} />
        <Route path="/add-family" element={<AddFamily />} />
        <Route path="/edit-family/:id" element={<EditFamily />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </DataProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;