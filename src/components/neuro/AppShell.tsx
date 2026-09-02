import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  BrainCircuit,
  Cpu,
  Gauge,
  History,
  Home,
  Lightbulb,
  Menu,
  MessageSquareHeart,
  Settings as SettingsIcon,
  User,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Disclaimer, StatusDot } from "@/components/neuro/primitives";
import { useNeuro } from "@/lib/neuro/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/patient", label: "Patient", icon: User },
  { to: "/communication", label: "Communication", icon: MessageSquareHeart },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/devices", label: "Devices", icon: Cpu },
  { to: "/ai-model", label: "AI Model", icon: BrainCircuit },
  { to: "/controls", label: "Controls", icon: Lightbulb },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Activity className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">NeuroBridge</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { devices, systemOnline, caregiver, alerts } = useNeuro();
  const newAlerts = alerts.filter((a) => a.status === "new").length;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="p-5">
          <Logo />
        </div>
        <nav aria-label="Main" className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-base font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                pathname === to && "bg-primary text-primary-foreground hover:bg-primary",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
              {to === "/alerts" && newAlerts > 0 ? (
                <span className="ml-auto rounded-full bg-emergency px-2 py-0.5 text-xs font-bold text-emergency-foreground">
                  {newAlerts}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            System
          </p>
          <ul className="mt-2 space-y-1.5">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center gap-2 text-sm text-foreground">
                <StatusDot status={d.status} pulse={false} />
                {d.name}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <Menu className="size-6" /> : <Menu className="size-6" />}
            </Button>
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold sm:inline-flex">
                <StatusDot status={systemOnline ? "connected" : "degraded"} />
                {systemOnline ? "System Connected" : "System Degraded"}
              </span>
              <Link
                to="/alerts"
                aria-label={`Notifications, ${newAlerts} new`}
                className="relative grid size-11 place-items-center rounded-full hover:bg-secondary"
              >
                <Bell className="size-5" aria-hidden="true" />
                {newAlerts > 0 ? (
                  <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-emergency text-[11px] font-bold text-emergency-foreground">
                    {newAlerts}
                  </span>
                ) : null}
              </Link>
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  DC
                </span>
                <span className="hidden text-sm font-semibold sm:inline">{caregiver.name}</span>
              </div>
            </div>
          </div>

          {/* Mobile nav */}
          {open ? (
            <nav aria-label="Mobile" className="grid gap-1 border-t border-border p-3 lg:hidden">
              {NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium",
                    pathname === to ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {label}
                </Link>
              ))}
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium hover:bg-secondary"
              >
                <Home className="size-5" aria-hidden="true" />
                Landing page
              </Link>
            </nav>
          ) : null}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-border px-4 py-6 sm:px-6 lg:px-8">
          <Disclaimer />
          <p className="mt-2 text-xs text-muted-foreground">
            Patient biosignal data should be handled securely and only accessed by authorized users.
          </p>
        </footer>
      </div>
      <span className="sr-only">
        <X aria-hidden="true" />
      </span>
    </div>
  );
}
