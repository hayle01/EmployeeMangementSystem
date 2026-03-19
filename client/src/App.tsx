import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "./pages/Login";
import EmployeePublic from "./pages/EmployeePublic";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import EmployeeForm from "./pages/EmployeeForm";
import EmployeeDetail from "./pages/EmployeeDetail";
import UserManagement from "./pages/UserManagement";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";
import { PublicRoute } from "./components/PublicRoute";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route path="/employee-public/:slug" element={<EmployeePublic />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="employees/new" element={<EmployeeForm />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="employees/:id/edit" element={<EmployeeForm />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute requireAdmin>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
