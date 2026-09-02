import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/neuro/AppShell";
import { DeviceStatusPanel } from "@/components/neuro/DeviceStatus";
import { DemoBadge, SectionHeading } from "@/components/neuro/primitives";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "Devices — NeuroBridge" },
      {
        name: "description",
        content:
          "Connection status, last communication, signal quality and stream state for the EMG sensor, Arduino Uno, AI model and network.",
      },
      { property: "og:title", content: "Devices — NeuroBridge" },
      {
        property: "og:description",
        content: "Monitor hardware health across the NeuroBridge signal chain.",
      },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionHeading
          title="Devices"
          description="Every link in the chain from electrode to caregiver notification."
          actions={<DemoBadge label="Simulated Hardware" />}
        />
        <DeviceStatusPanel detailed />
        <section className="surface-card p-5 sm:p-6" aria-label="Signal stabilization">
          <h2 className="text-xl font-semibold text-foreground">Signal Stabilization</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { name: "Moving Average Filtering", text: "Smooths high-frequency EMG noise." },
              { name: "Threshold Validation", text: "Rejects samples below the detection floor." },
              { name: "Cooldown Timer", text: "Blocks repeat triggers after a command fires." },
            ].map((s) => (
              <li key={s.name} className="rounded-xl border border-border bg-secondary/50 p-4">
                <p className="text-base font-semibold text-foreground">{s.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                <span className="mt-3 inline-flex rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success">
                  Active
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
