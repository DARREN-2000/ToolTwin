import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { Command } from "cmdk";
import toast from "react-hot-toast";
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
  Search,
  Puzzle,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, roles: ["operator", "approver", "auditor", "admin"] },
  { to: "/app/console", label: "Action Console", icon: Zap, roles: ["operator", "admin"] },
  { to: "/app/review", label: "Review Queue", icon: ClipboardList, roles: ["approver", "admin"] },
  { to: "/app/audit", label: "Audit Log", icon: ScrollText, roles: ["auditor", "admin"] },
  { to: "/app/policies", label: "Policies", icon: ShieldCheck, roles: ["admin"] },
  { to: "/app/tools", label: "Tool Catalog", icon: Wrench, roles: ["operator", "approver", "auditor", "admin"] },
  { to: "/app/settings", label: "Integration & Settings", icon: Puzzle, roles: ["admin"] },
];

export default function Layout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const filteredNav = navItems.filter(
    (item) => profile && item.roles.includes(profile.role),
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Command Palette Overlay */}
      {cmdOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
          onClick={() => setCmdOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl mx-4"
          >
            <Command className="bg-muted border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center border-b border-border px-4">
                <Search className="w-5 h-5 text-foreground/50 mr-2" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="w-full py-4 bg-transparent text-foreground outline-none border-none focus:ring-0 placeholder:text-foreground/50"
                  autoFocus
                />
              </div>
              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                <Command.Empty className="p-6 text-center text-sm text-foreground/50">
                  No results found.
                </Command.Empty>

                <Command.Group
                  heading={
                    <div className="px-3 py-2 text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                      Navigation
                    </div>
                  }
                >
                  {filteredNav.map((item) => (
                    <Command.Item
                      key={item.to}
                      onSelect={() => {
                        navigate(item.to);
                        setCmdOpen(false);
                      }}
                      className="px-3 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary aria-selected:bg-primary/10 aria-selected:text-primary rounded-lg cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group
                  heading={
                    <div className="px-3 py-2 text-xs font-semibold text-foreground/50 uppercase tracking-wider mt-4">
                      AI Actions
                    </div>
                  }
                >
                  <Command.Item
                    onSelect={() => {
                      toast.success("✨ Mock report generated!");
                      setCmdOpen(false);
                    }}
                    className="px-3 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary aria-selected:bg-primary/10 aria-selected:text-primary rounded-lg cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    ✨ Generate Mock Report
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      toast.success("🧠 System optimization started...");
                      setCmdOpen(false);
                    }}
                    className="px-3 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary aria-selected:bg-primary/10 aria-selected:text-primary rounded-lg cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    🧠 Optimize Policy
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-background md:bg-muted/50 border-r border-border flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between gap-3">
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
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 -mr-2 text-foreground/50 hover:text-foreground md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-border">
          <button
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Search
            </span>
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </span>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              end={item.to === "/app"}
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
              <p className="text-xs text-foreground/50 capitalize">
                {profile?.role}
              </p>
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex-none flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-on-primary" />
            </div>
            <h1 className="text-lg font-heading font-bold text-foreground">ToolTwin</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-foreground/70 hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
