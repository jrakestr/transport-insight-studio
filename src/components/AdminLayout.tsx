import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Newspaper, Building2, Truck, Target, FileText, BookOpen, Sparkles, Inbox, Zap, Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Articles", url: "/admin/articles", icon: Newspaper },
  { title: "Agencies", url: "/admin/agencies", icon: Building2 },
  { title: "Service Providers", url: "/admin/providers", icon: Truck },
  { title: "Transportation Providers", url: "/admin/transportation-providers", icon: Building2 },
  { title: "Opportunities", url: "/admin/opportunities", icon: Target },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Playbooks", url: "/admin/playbooks", icon: BookOpen },
  { title: "Review Queue", url: "/admin/pending-articles", icon: Inbox },
  { title: "AI Assistant", url: "/admin/agentic-review", icon: Sparkles },
  { title: "Test Searches", url: "/admin/automated-search-test", icon: Zap },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const isActivePath = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen w-full">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-indigo-600 p-6">
            <div className="flex items-center justify-between mb-8">
              <Link to="/admin" className="text-xl font-bold text-white" onClick={() => setSidebarOpen(false)}>
                Admin Panel
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-y-7">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.url}>
                    <Link
                      to={item.url}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold",
                        isActivePath(item.url)
                          ? "bg-indigo-700 text-white"
                          : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
                      )}
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-indigo-500">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-indigo-200 hover:bg-indigo-700 hover:text-white"
                >
                  <LogOut className="h-6 w-6 shrink-0" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/admin" className="text-xl font-bold text-white">
              Admin Panel
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navItems.map((item) => (
                    <li key={item.url}>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold",
                          isActivePath(item.url)
                            ? "bg-indigo-700 text-white"
                            : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <div className="border-t border-indigo-500 pt-4 px-6">
                  <Link
                    to="/"
                    className="flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-indigo-200 hover:bg-indigo-700 hover:text-white mb-2"
                  >
                    <span className="text-xs">↗</span>
                    View Site
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  >
                    <LogOut className="h-6 w-6 shrink-0" />
                    Logout
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-indigo-600 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-indigo-200 hover:text-white"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold text-white">Admin Panel</div>
      </div>

      {/* Main content */}
      <main className="py-10 lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
