import { BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AlertStatusBadge } from "@/components/neuro/primitives";
import { useNeuro } from "@/lib/neuro/store";
import { SIGNAL_LABEL } from "@/lib/neuro/types";

function fmt(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function CaregiverRequestCard() {
  const { activeCaregiverRequest, respondToAlert, dismissAlert, resolveAlert, responseTimer } =
    useNeuro();
  if (!activeCaregiverRequest) return null;
  const a = activeCaregiverRequest;
  const waiting = a.status === "new";

  return (
    <section
      aria-live="polite"
      className="surface-card border-warning/50 bg-warning-soft/60 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-warning text-warning-foreground">
            <BellRing className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">CAREGIVER REQUEST</h2>
            <p className="mt-1 text-base text-foreground/80">
              Patient has requested caregiver assistance.
            </p>
          </div>
        </div>
        <AlertStatusBadge status={a.status} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-5">
        {[
          ["Patient", a.patient],
          ["Room", a.room],
          ["Time", new Date(a.timestamp).toLocaleTimeString()],
          ["Detected signal", SIGNAL_LABEL[a.signalType]],
          ["Confidence", `${(a.confidence * 100).toFixed(0)}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-card/80 p-3">
            <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {label}
            </dt>
            <dd className="mt-1 font-bold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-base font-semibold text-foreground">
        {waiting ? "Status: Waiting for response" : "Caregiver is responding to the request."}
        {!waiting ? (
          <span className="ml-2 tabular-nums text-muted-foreground">
            Response time: {fmt(responseTimer)}
          </span>
        ) : null}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {waiting ? (
          <>
            <Button size="lg" className="min-h-12" onClick={() => respondToAlert(a.id)}>
              Accept Request
            </Button>
            <Button size="lg" variant="outline" className="min-h-12" onClick={() => dismissAlert(a.id)}>
              Dismiss
            </Button>
          </>
        ) : (
          <Button size="lg" className="min-h-12" onClick={() => resolveAlert(a.id)}>
            Mark Resolved
          </Button>
        )}
      </div>
    </section>
  );
}
