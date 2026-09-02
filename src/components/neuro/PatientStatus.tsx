import { Activity, HeartPulse, Radio, Timer, Wifi } from "lucide-react";

import { MiniWaveform } from "@/components/neuro/EMGChart";
import { StatusPill } from "@/components/neuro/primitives";
import { useNeuro } from "@/lib/neuro/store";
import { SIGNAL_LABEL } from "@/lib/neuro/types";

export function PatientStatus() {
  const { patient, currentSignal, prediction, settings, systemOnline } = useNeuro();

  const items = [
    { icon: HeartPulse, label: "Patient Status", value: settings.monitoring ? "Monitoring" : "Paused" },
    { icon: Activity, label: "Current Signal", value: SIGNAL_LABEL[currentSignal] },
    { icon: Radio, label: "AI Prediction", value: SIGNAL_LABEL[prediction.predicted] },
    { icon: Activity, label: "Confidence", value: `${(prediction.confidence * 100).toFixed(0)}%` },
    { icon: Timer, label: "Last Activity", value: "Just now" },
    { icon: Wifi, label: "Connection", value: systemOnline ? "Stable" : "Degraded" },
  ];

  return (
    <section className="surface-card p-5 sm:p-6" aria-label="Live patient status">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Live Patient Status</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {patient.name} · {patient.room} · ID {patient.id}
          </p>
        </div>
        <StatusPill tone={systemOnline ? "success" : "warning"} status={systemOnline ? "connected" : "degraded"}>
          {systemOnline ? "System Connected" : "Check Devices"}
        </StatusPill>
      </div>

      <div className="mt-4 rounded-xl bg-teal-soft/60 px-4 py-3">
        <MiniWaveform active={settings.monitoring} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-secondary/60 p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </dt>
            <dd className="mt-2 text-lg font-bold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
