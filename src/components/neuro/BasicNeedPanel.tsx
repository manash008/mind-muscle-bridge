import { AlertTriangle, Bed, Droplet, MoreHorizontal, Pill, Toilet, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useNeuro } from "@/lib/neuro/store";

export const NEEDS = [
  { id: "Water", icon: Droplet },
  { id: "Food", icon: Utensils },
  { id: "Medication", icon: Pill },
  { id: "Washroom", icon: Toilet },
  { id: "Change Position", icon: Bed },
  { id: "Pain / Discomfort", icon: AlertTriangle },
  { id: "Other", icon: MoreHorizontal },
];

export function BasicNeedPanel() {
  const { needPanelOpen, setNeedPanelOpen, selectNeed, prediction } = useNeuro();
  if (!needPanelOpen) return null;

  return (
    <section
      className="surface-card border-primary/40 bg-info-soft p-5 sm:p-6"
      aria-live="polite"
      aria-label="Basic need detected"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Basic Need Detected</h2>
          <p className="mt-1 text-base text-foreground/80">
            Single twitch confirmed at {(prediction.confidence * 100).toFixed(0)}% confidence. Select
            the requested need to notify the caregiver.
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={() => setNeedPanelOpen(false)}>
          Cancel
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {NEEDS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => selectNeed(id)}
            className="flex min-h-24 flex-col items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-secondary focus-visible:border-primary"
          >
            <Icon className="size-7 text-primary" aria-hidden="true" />
            <span className="text-lg font-semibold text-foreground">{id}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
