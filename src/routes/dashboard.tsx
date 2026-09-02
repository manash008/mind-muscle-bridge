import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ShieldAlert, Hand } from "lucide-react";

import { AppShell } from "@/components/neuro/AppShell";
import { AIClassification } from "@/components/neuro/AIClassification";
import { BasicNeedPanel } from "@/components/neuro/BasicNeedPanel";
import { CaregiverRequestCard } from "@/components/neuro/CaregiverRequest";
import { DeviceStatusPanel } from "@/components/neuro/DeviceStatus";
import { EMGChart } from "@/components/neuro/EMGChart";
import { EmergencyAlertBanner } from "@/components/neuro/EmergencyAlert";
import { PatientStatus } from "@/components/neuro/PatientStatus";
import { SimulatorPanel } from "@/components/neuro/Simulator";
import { AlertStatusBadge, StatusPill } from "@/components/neuro/primitives";
import { Button } from "@/components/ui/button";
import { useNeuro } from "@/lib/neuro/store";
import { SIGNAL_LABEL } from "@/lib/neuro/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Caregiver Dashboard — NeuroBridge" },
      {
        name: "description",
        content:
          "Live caregiver dashboard: EMG signal, AI twitch classification, basic needs, caregiver calls and emergency alerts.",
      },
      { property: "og:title", content: "Caregiver Dashboard — NeuroBridge" },
      {
        property: "og:description",
        content: "Monitor EMG signals and respond to patient requests in real time.",
      },
    ],
  }),
  component: DashboardPage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  const { patient, devices, alerts, systemOnline, simulate, setNeedPanelOpen } = useNeuro();
  const recent = alerts.slice(0, 6);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {greeting()}, Caregiver
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Patient: <span className="font-semibold text-foreground">{patient.name}</span> ·{" "}
              {patient.room}
            </p>
          </div>
          <StatusPill
            tone={systemOnline ? "success" : "warning"}
            status={systemOnline ? "connected" : "degraded"}
          >
            {systemOnline ? "System Connected" : "System Degraded"}
          </StatusPill>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {devices.map((d) => (
            <li key={d.id} className="surface-card flex items-center justify-between gap-3 p-4">
              <span className="text-sm font-semibold text-foreground">{d.name}</span>
              <StatusPill
                tone={
                  d.status === "connected" ? "success" : d.status === "degraded" ? "warning" : "emergency"
                }
                status={d.status}
              >
                {d.status === "connected"
                  ? "Connected"
                  : d.status === "degraded"
                    ? "Unstable"
                    : "Disconnected"}
              </StatusPill>
            </li>
          ))}
        </ul>

        <EmergencyAlertBanner />
        <CaregiverRequestCard />
        <BasicNeedPanel />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <PatientStatus />
            <EMGChart />
            <AIClassification />
            <SimulatorPanel />
          </div>

          <div className="space-y-6">
            <section className="surface-card p-5 sm:p-6">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <div className="mt-4 grid gap-3">
                <Button size="lg" className="min-h-14 justify-start gap-3 text-base" onClick={() => setNeedPanelOpen(true)}>
                  <Hand className="size-5" aria-hidden="true" /> View Basic Needs
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="min-h-14 justify-start gap-3 text-base"
                  onClick={() => simulate("double_twitch")}
                >
                  <Bell className="size-5" aria-hidden="true" /> Call Caregiver
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="min-h-14 justify-start gap-3 text-base"
                  onClick={() => simulate("long_twitch")}
                >
                  <ShieldAlert className="size-5" aria-hidden="true" /> Emergency Alert
                </Button>
              </div>
            </section>

            <DeviceStatusPanel />

            <section className="surface-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <Link to="/history" className="text-sm font-semibold text-primary underline">
                  View history
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {recent.map((a) => (
                  <li key={a.id} className="rounded-xl border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{a.label}</span>
                      <AlertStatusBadge status={a.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {SIGNAL_LABEL[a.signalType]} · {(a.confidence * 100).toFixed(0)}% ·{" "}
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
