import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/neuro/AppShell";
import { AlertStatusBadge, SectionHeading } from "@/components/neuro/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNeuro } from "@/lib/neuro/store";
import { SIGNAL_LABEL, type Alert } from "@/lib/neuro/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alert Center — NeuroBridge" },
      {
        name: "description",
        content:
          "Chronological alert center for basic needs, caregiver requests and emergency alerts with filters and search.",
      },
      { property: "og:title", content: "Alert Center — NeuroBridge" },
      {
        property: "og:description",
        content: "Triage patient alerts by type and status in one accessible list.",
      },
    ],
  }),
  component: AlertsPage,
});

const FILTERS = ["All", "Emergency", "Caregiver", "Basic Need", "Resolved"] as const;

const TYPE_LABEL: Record<Alert["type"], string> = {
  basic_need: "Basic Need",
  caregiver_request: "Caregiver Request",
  emergency: "Emergency",
};

function AlertsPage() {
  const { alerts, acknowledgeAlert, respondToAlert, resolveAlert } = useNeuro();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    return alerts.filter((a) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Emergency" && a.type === "emergency") ||
        (filter === "Caregiver" && a.type === "caregiver_request") ||
        (filter === "Basic Need" && a.type === "basic_need") ||
        (filter === "Resolved" && a.status === "resolved");
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        [a.label, a.patient, a.room, a.id, TYPE_LABEL[a.type]].some((v) =>
          v.toLowerCase().includes(q),
        );
      return matchesFilter && matchesQuery;
    });
  }, [alerts, filter, query]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Alert Center"
          description="All patient alerts in chronological order. Emergency alerts stay visually prominent until resolved."
        />

        <div className="surface-card mb-6 flex flex-wrap items-center gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                className="min-h-11"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f}
              </Button>
            ))}
          </div>
          <div className="ml-auto w-full sm:w-64">
            <label htmlFor="alert-search" className="sr-only">
              Search alerts
            </label>
            <Input
              id="alert-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search alerts…"
              className="min-h-11"
            />
          </div>
        </div>

        <ul className="space-y-4">
          {list.map((a) => (
            <li
              key={a.id}
              className={cn(
                "surface-card p-5",
                a.type === "emergency" && a.status !== "resolved" && "border-2 border-emergency bg-emergency-soft",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-foreground">{a.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {TYPE_LABEL[a.type]} · {a.patient} · {a.room} · {SIGNAL_LABEL[a.signalType]} ·{" "}
                    {(a.confidence * 100).toFixed(0)}% · {new Date(a.timestamp).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Alert ID: {a.id}</p>
                </div>
                <AlertStatusBadge status={a.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="min-h-11"
                  variant="secondary"
                  disabled={a.status !== "new"}
                  onClick={() => acknowledgeAlert(a.id)}
                >
                  Acknowledge
                </Button>
                <Button
                  className="min-h-11"
                  variant="outline"
                  disabled={a.status === "resolved"}
                  onClick={() => respondToAlert(a.id)}
                >
                  Mark as Responding
                </Button>
                <Button
                  className="min-h-11"
                  disabled={a.status === "resolved"}
                  onClick={() => resolveAlert(a.id)}
                >
                  Mark Resolved
                </Button>
              </div>
            </li>
          ))}
          {list.length === 0 ? (
            <li className="surface-card p-8 text-center text-muted-foreground">
              No alerts match this filter.
            </li>
          ) : null}
        </ul>
      </div>
    </AppShell>
  );
}
