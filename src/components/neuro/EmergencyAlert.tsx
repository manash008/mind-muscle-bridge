import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AlertStatusBadge } from "@/components/neuro/primitives";
import { useNeuro } from "@/lib/neuro/store";
import { SIGNAL_LABEL } from "@/lib/neuro/types";

export function EmergencyAlertBanner() {
  const { activeEmergency, acknowledgeAlert, respondToAlert, resolveAlert } = useNeuro();
  if (!activeEmergency) return null;
  const a = activeEmergency;

  return (
    <section
      role="alert"
      aria-live="assertive"
      className="surface-card border-2 border-emergency bg-emergency-soft p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="pulse-emergency grid size-12 shrink-0 place-items-center rounded-full bg-emergency text-emergency-foreground">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-emergency sm:text-3xl">
              EMERGENCY ALERT
            </h2>
            <p className="mt-1 max-w-2xl text-base font-medium text-foreground">
              Long muscle contraction detected. Immediate assistance may be required.
            </p>
          </div>
        </div>
        <AlertStatusBadge status={a.status} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Patient", a.patient],
          ["Room", a.room],
          ["Time", new Date(a.timestamp).toLocaleTimeString()],
          ["Signal", SIGNAL_LABEL[a.signalType]],
          ["AI confidence", `${(a.confidence * 100).toFixed(0)}%`],
          ["Alert ID", a.id],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-card/80 p-3">
            <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {label}
            </dt>
            <dd className="mt-1 font-bold break-all text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          size="lg"
          className="min-h-12 bg-emergency text-emergency-foreground hover:bg-emergency/90"
          onClick={() => acknowledgeAlert(a.id)}
        >
          ACKNOWLEDGE EMERGENCY
        </Button>
        <Button size="lg" variant="secondary" className="min-h-12" onClick={() => respondToAlert(a.id)}>
          CALL CAREGIVER
        </Button>
        <Button size="lg" variant="outline" className="min-h-12" onClick={() => respondToAlert(a.id)}>
          MARK AS RESPONDING
        </Button>
        <Button size="lg" variant="ghost" className="min-h-12" onClick={() => resolveAlert(a.id)}>
          Resolve
        </Button>
      </div>

      <p className="mt-4 text-sm font-medium text-foreground/80">
        Emergency notification sent to assigned caregiver. This prototype does not contact hospitals,
        ambulances, or emergency services.
      </p>
    </section>
  );
}
