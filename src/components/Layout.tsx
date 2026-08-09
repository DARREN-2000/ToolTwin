import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  Zap,
  ClipboardList,
  ShieldCheck,
  ScrollText,
  FileText,
  Wrench,
  LogOut,
  Activity,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["operator", "approver", "auditor", "admin"] },
  { to: "/console", label: "Action Console", icon: Zap, roles: ["operator", "admin"] },
  { to: "/review", label: "Review Queue", icon: ClipboardList, roles: ["approver", "admin"] },
  { to: "/audit", label: "Audit Log", icon: ScrollText, roles: ["auditor", "admin"] },
  { to: "/policies", label: "Policies", icon: ShieldCheck, roles: ["admin"] },
  { to: "/tools", label: "Tool Catalog", icon: Wrench, roles: ["operator", "approver", "auditor", "admin"] },
];

export default function Layout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const filteredNav = navItems.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-muted/50 border-r border-border flex flex-col shrink-0">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-on-primary" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold text-foreground leading-tight">
                ToolTwin
              </h1>
              <p className="text-xs text-foreground/50">AI Safety Layer</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-foreground/60 hover:text-foreground hover:bg-secondary/50"
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {profile?.full_name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name ?? "User"}
              </p>
              <p className="text-xs text-foreground/50 capitalize">{profile?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
