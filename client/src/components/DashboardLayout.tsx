import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { NavLink } from "@/components/NavLinks"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Shield,
  LayoutDashboard,
  Users,
  UserCog,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { labels } from "@/lib/labels"

const navItems = [
  { title: labels.dashboard.overview, url: "/dashboard", icon: LayoutDashboard },
  { title: labels.employee.employeeManagement, url: "/dashboard/employees", icon: Users },
  { title: labels.users.userManagement, url: "/dashboard/users", icon: UserCog, adminOnly: true },
  { title: labels.settings.settings, url: "/dashboard/settings", icon: Settings },
]

function AppSidebar() {
  const { isAdmin } = useAuth()

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <Sidebar className="border-r-0">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">EmployeeConnect</span>
      </div>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end={item.url === "/dashboard"}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    activeClassName="bg-primary text-primary-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4">
        <LogoutButton />
      </div>
    </Sidebar>
  )
}

function LogoutButton() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </button>
  )
}

function DashboardHeader() {
  const { user, userRole, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const getPageTitle = () => {
    if (location.pathname === "/dashboard") return labels.dashboard.overview
    if (location.pathname.includes("/employees")) return labels.employee.employeeManagement
    if (location.pathname.includes("/users")) return labels.users.userManagement
    if (location.pathname.includes("/settings")) return labels.settings.settings
    return "Dashboard"
  }

  const handleLogout = () => {
    signOut()
    navigate("/login")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">{getPageTitle()}</h1>
          <p className="text-xs text-muted-foreground">Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={labels.common.search} className="h-9 w-64 pl-9" />
        </div>

        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {user?.username?.charAt(0).toUpperCase() ?? "A"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium">{user?.username ?? "admin"}</p>
              <p className="text-xs capitalize text-muted-foreground">{userRole ?? "staff"}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              {labels.settings.settings}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-auto bg-background p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}