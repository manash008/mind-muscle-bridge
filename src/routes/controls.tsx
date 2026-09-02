import { createFileRoute } from "@tanstack/react-router";
import { Bell, Fan, Lightbulb, Plug } from "lucide-react";

import { AppShell } from "@/components/neuro/AppShell";
import { DemoBadge, SectionHeading } from "@/components/neuro/primitives";
import { Switch } from "@/components/ui/switch";
import { useNeuro } from "@/lib/neuro/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/controls")({
  head: () => ({
    meta: [
      { title: "Smart Controls — NeuroBridge" },
      {
        name: "description",
        content:
          "Simulated smart-room controls for light, fan, alarm and other devices, ready to connect to physical IoT hardware.",
      },
      { property: "og:title", content: "Smart Controls — NeuroBridge" },
      {
        property: "og:description",
        content: "Toggle room devices from the caregiver dashboard.",
      },
    ],
  }),
  component: ControlsPage,
});

const DEVICES = [
  { id: "light", label: "Light", icon: Lightbulb },
  { id: "fan", label: "Fan", icon: Fan },
  { id: "alarm", label: "Alarm", icon: Bell },
  { id: "other", label: "Other Device", icon: Plug },
];

function ControlsPage() {
  const { smartDevices, toggleSmartDevice } = useNeuro();

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionHeading
          title="Smart Controls"
          description="Room devices the patient can trigger through mapped twitch commands."
          actions={<DemoBadge label="Demo Mode" />}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {DEVICES.map(({ id, label, icon: Icon }) => {
            const on = smartDevices[id] ?? false;
            return (
              <div
                key={id}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-2xl border p-6 transition-colors",
                  on ? "border-teal/40 bg-teal-soft" : "border-border bg-card",
                )}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "grid size-14 place-items-center rounded-xl",
                      on ? "bg-teal text-teal-foreground" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xl font-semibold text-foreground">{label}</p>
                    <p className="text-base font-bold text-muted-foreground">{on ? "ON" : "OFF"}</p>
                  </div>
                </div>
                <Switch
                  checked={on}
                  onCheckedChange={() => toggleSmartDevice(id)}
                  aria-label={`Toggle ${label}`}
                />
              </div>
            );
          })}
        </div>

        <p className="rounded-xl border border-warning/40 bg-warning-soft p-4 text-base font-medium text-warning-foreground">
          Device controls are simulated until connected to physical IoT hardware.
        </p>
      </div>
    </AppShell>
  );
}
