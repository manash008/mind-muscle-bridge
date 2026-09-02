import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/neuro/AppShell";
import { DeviceStatusPanel } from "@/components/neuro/DeviceStatus";
import { PatientStatus } from "@/components/neuro/PatientStatus";
import { DemoBadge, SectionHeading } from "@/components/neuro/primitives";
import { useNeuro } from "@/lib/neuro/store";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Patient Profile — NeuroBridge" },
      {
        name: "description",
        content:
          "Demo patient profile with room, assigned caregiver and EMG, Arduino and AI model connection status.",
      },
      { property: "og:title", content: "Patient Profile — NeuroBridge" },
      {
        property: "og:description",
        content: "Profile and live connection status for the monitored patient.",
      },
    ],
  }),
  component: PatientPage,
});

function PatientPage() {
  const { patient, caregiver } = useNeuro();

  const fields = [
    { label: "Patient name", value: patient.name },
    { label: "Patient ID", value: patient.id },
    { label: "Room", value: patient.room },
    { label: "Assigned caregiver", value: caregiver.name },
    { label: "Shift", value: caregiver.shift },
    { label: "Monitoring status", value: patient.status },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionHeading
          title="Patient"
          description="Profile, assigned caregiver and device connectivity for the monitored patient."
          actions={<DemoBadge label="Demo Profile" />}
        />

        <section className="surface-card p-5 sm:p-6" aria-label="Patient details">
          <h2 className="text-xl font-semibold text-foreground">Profile</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.label} className="rounded-xl border border-border bg-secondary/50 p-4">
                <dt className="text-sm font-medium text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 rounded-xl border border-warning/40 bg-warning-soft p-4 text-base font-medium text-warning-foreground">
            Demo patient profile — no real medical data.
          </p>
        </section>

        <PatientStatus />
        <DeviceStatusPanel detailed />
      </div>
    </AppShell>
  );
}
