import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/neuro/AppShell";
import { AlertStatusBadge, SectionHeading } from "@/components/neuro/primitives";
import { Button } from "@/components/ui/button";
import { useNeuro } from "@/lib/neuro/store";
import { SIGNAL_LABEL } from "@/lib/neuro/types";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Signal History — NeuroBridge" },
      {
        name: "description",
        content:
          "Chronological timeline of detected twitch signals with action, confidence, response time and resolution status.",
      },
      { property: "og:title", content: "Signal History — NeuroBridge" },
      {
        property: "og:description",
        content: "Review every detected signal and how quickly it was answered.",
      },
    ],
  }),
  component: HistoryPage,
});

const RANGES = ["Today", "Last 7 days", "Last 30 days", "All time"] as const;
const RANGE_DAYS: Record<(typeof RANGES)[number], number> = {
  Today: 1,
  "Last 7 days": 7,
  "Last 30 days": 30,
  "All time": 36500,
};

function HistoryPage() {
  const { alerts } = useNeuro();
  const [range, setRange] = useState<(typeof RANGES)[number]>("Last 7 days");

  const rows = useMemo(() => {
    const cutoff = Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000;
    return alerts.filter((a) => new Date(a.timestamp).getTime() >= cutoff);
  }, [alerts, range]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <SectionHeading
          title="History"
          description="Every classified signal, the action it triggered and how it was resolved."
        />

        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <Button
              key={r}
              variant={r === range ? "default" : "outline"}
              className="min-h-11"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
        </div>

        <section className="surface-card overflow-x-auto p-0" aria-label="Signal history">
          <table className="w-full min-w-[46rem] text-left">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="px-5 py-3 font-medium">Date &amp; time</th>
                <th className="px-5 py-3 font-medium">Signal</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Confidence</th>
                <th className="px-5 py-3 font-medium">Response</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-4 text-base text-foreground">
                    {new Date(a.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-base font-semibold text-foreground">
                    {SIGNAL_LABEL[a.signalType]}
                  </td>
                  <td className="px-5 py-4 text-base text-muted-foreground">{a.label}</td>
                  <td className="px-5 py-4 text-base text-foreground">
                    {Math.round(a.confidence * 100)}%
                  </td>
                  <td className="px-5 py-4 text-base text-muted-foreground">
                    {a.responseSeconds != null ? `${a.responseSeconds}s` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <AlertStatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    No signals recorded in this period.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
