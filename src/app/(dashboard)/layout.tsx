"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RouteGuard } from "@/components/shared/route-guard";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { authService } from "@/services/auth";
import { UserSession } from "@/types";
import { sidebarMainItems, sidebarAiItems, sidebarSupportItems } from "@/config/navigation";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [user, setUser] = React.useState<UserSession | null>(null);

  React.useEffect(() => {
    setUser(authService.getCachedUser());
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  // Generate dynamic breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter((p) => p && p !== "dashboard");
    if (paths.length === 0) return [{ label: "Dashboard", href: "/dashboard" }];

    const crumbs = [{ label: "Dashboard", href: "/dashboard" }];
    let currentPath = "/dashboard";

    paths.forEach((p) => {
      currentPath += `/${p}`;
      // Clean label
      const label = p
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      crumbs.push({ label, href: currentPath });
    });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const renderNavGroup = (items: typeof sidebarMainItems, title?: string) => {
    const filteredItems = items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredItems.length === 0) return null;

    return (
      <div className="space-y-1">
        {title && !isCollapsed && (
          <span className="mb-2 block px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            {title}
          </span>
        )}
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "" : "text-muted-foreground/80 group-hover:text-foreground"
                  )}
                />
              )}
              {(!isCollapsed || isMobileOpen) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              )}
              {/* Tooltip for collapsed state */}
              {isCollapsed && !isMobileOpen && (
                <div className="absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand/Logo header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-sm font-bold tracking-tight text-foreground">
                ResumeBuilder<span className="text-primary">Pro</span>
              </span>
            )}
          </Link>
          {/* Close button on Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="space-y-6">
          {renderNavGroup(sidebarMainItems)}
          {renderNavGroup(sidebarAiItems, "AI Modules")}
          {renderNavGroup(sidebarSupportItems, "Preferences")}
        </div>
      </div>

      {/* Logout footer */}
      <div>
        <DropdownMenuSeparator />
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <RouteGuard>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 hidden border-r border-border/40 bg-card/60 backdrop-blur-md transition-all duration-300 md:block",
            isCollapsed ? "w-[72px]" : "w-60"
          )}
        >
          {sidebarContent}
          {/* Toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 bottom-4 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md hover:bg-accent hover:text-foreground md:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </aside>

        {/* Mobile Slide-over Sidebar Drawer */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              />
              {/* Slide panel */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/40 bg-card shadow-2xl md:hidden"
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Right side page wrapper */}
        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300",
            isCollapsed ? "md:pl-[72px]" : "md:pl-60"
          )}
        >
          {/* Top header navigation */}
          <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              {/* Mobile menu hamburger toggle */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Dynamic Page Breadcrumbs */}
              <nav aria-label="Breadcrumb" className="hidden sm:block">
                <ol className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
                  {breadcrumbs.map((crumb, idx) => (
                    <li key={crumb.href} className="flex items-center space-x-2">
                      {idx > 0 && <span className="text-muted-foreground/40">/</span>}
                      {idx === breadcrumbs.length - 1 ? (
                        <span className="font-semibold text-foreground">{crumb.label}</span>
                      ) : (
                        <Link href={crumb.href} className="transition-colors hover:text-foreground">
                          {crumb.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            {/* Header Toolbar Actions */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative hidden max-w-[200px] md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search dashboard..."
                  className="h-9 w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 text-xs transition-colors focus:border-primary focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Dark/Light mode toggle */}
              <ThemeToggle />

              {/* Notification Menu */}
              <DropdownMenu
                trigger={
                  <div
                    role="button"
                    tabIndex={0}
                    className="relative cursor-pointer rounded-full border border-border/40 p-1.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <span className="sr-only">Notifications</span>
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                  </div>
                }
              >
                <div className="border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
                  Recent Notifications
                </div>
                <DropdownMenuItem className="py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-foreground">ATS Scan Complete</span>
                    <span className="text-[10px] text-muted-foreground">
                      Your resume scored 84/100 points.
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="border-t border-border/20 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-foreground">AI Review Ready</span>
                    <span className="text-[10px] text-muted-foreground">
                      New formatting suggestions are available.
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenu>

              {/* Profile User Dropdown Menu */}
              <DropdownMenu
                trigger={
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-border/40 p-1 pr-3 outline-none transition-all hover:bg-accent hover:text-foreground"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm shadow-primary/10">
                      {user?.name ? user.name.charAt(0) : "U"}
                    </div>
                    <span className="hidden text-xs font-semibold text-muted-foreground md:inline">
                      {user?.name || "User"}
                    </span>
                  </div>
                }
              >
                <div className="border-b border-border px-3 py-2 text-xs">
                  <p className="font-semibold text-foreground">{user?.name || "User"}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
          </header>

          {/* Main workspace scroll area */}
          <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mx-auto max-w-7xl"
            >
              {children}
            </motion.div>
          </main>

          {/* Dashboard Footer */}
          <footer className="border-t border-border/40 bg-card/20 px-6 py-4 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AI Resume Builder Pro. Built with Next.js 15 & React
            19.
          </footer>
        </div>
      </div>
    </RouteGuard>
  );
}
