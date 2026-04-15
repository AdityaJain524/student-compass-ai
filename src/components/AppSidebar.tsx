import {
  LayoutDashboard,
  Compass,
  GraduationCap,
  Calculator,
  MessageCircle,
  FileText,
  Banknote,
  Bell,
  Settings,
  Trophy,
  Shield,
  LogOut,
  PenTool,
  Calendar,
  Sparkles,
  Rocket,
  DollarSign,
  Brain,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Career Navigator", url: "/career", icon: Compass },
  { title: "Admission Predictor", url: "/admission", icon: GraduationCap },
  { title: "ROI Calculator", url: "/roi", icon: Calculator },
  { title: "AI Mentor", url: "/chat", icon: MessageCircle },
  { title: "SOP Generator", url: "/sop", icon: PenTool },
  { title: "Timeline", url: "/timeline", icon: Calendar },
  { title: "AI Content", url: "/ai-content", icon: Sparkles },
  { title: "Applications", url: "/applications", icon: FileText },
  { title: "Loan Assistance", url: "/loans", icon: Banknote },
  { title: "Rewards", url: "/rewards", icon: Trophy },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Growth Engine", url: "/growth-engine", icon: Rocket },
  { title: "Business", url: "/business", icon: DollarSign },
  { title: "AI Journey", url: "/ai-flow", icon: Brain },
];

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: Shield },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <Sidebar collapsible="icon" className="gradient-sidebar border-r-0">
      <SidebarContent>
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold text-sidebar-primary-foreground">UniPath</h1>
              <p className="text-[10px] text-sidebar-foreground/60">Student Platform</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === "/"} className="transition-colors" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} className="transition-colors" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign Out" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
