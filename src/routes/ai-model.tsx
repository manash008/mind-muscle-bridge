import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/neuro/AppShell";
import { DemoBadge, SectionHeading } from "@/components/neuro/primitives";

export const Route = createFileRoute("/ai-model")({
  head: () => ({
    meta: [
      { title: "AI Model — NeuroBridge" },
      {
        name: "description",
        content:
          "Signal processing pipeline, model comparison and prototype accuracy metrics for the NeuroBridge twitch classifier.",
      },
      { property: "og:title", content: "AI Model — NeuroBridge" },
      {
        property: "og:description",
        content: "How EMG samples become classified twitch commands.",
      },
    ],
  }),
  component: AIModelPage,
});

const PIPELINE = [
  "EMG Signal",
  "Noise Filtering",
  "Normalization",
  "Feature Extraction",
  "AI Classification",
  "Command",
  "Action",
];

const MODELS = [
  {
    name: "Logistic Regression",
    preferred: false,
    text: "Fast and interpretable baseline, but sensitive to noisy, non-linear EMG features.",
  },
  {
    name: "Random Forest",
    preferred: true,
    text: "Preferred: better noise handling, stronger generalisation across sessions and less overfitting on small datasets.",
  },
];

const METRICS = [
  { label: "Accuracy", value: "94.2%" },
  { label: "Precision", value: "93.5%" },
  { label: "Recall", value: "92.8%" },
  { label: "Avg. inference", value: "18 ms" },
];

function AIModelPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionHeading
          title="AI Model"
          description="From raw EMG samples to a confirmed caregiver action."
          actions={<DemoBadge label="Prototype / Demo Metrics" />}
        />

        <section className="surface-card p-5 sm:p-6" aria-label="Processing pipeline">
          <h2 className="text-xl font-semibold text-foreground">Processing Pipeline</h2>
          <ol className="mt-4 flex flex-wrap items-center gap-2">
            {PIPELINE.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-base font-semibold text-foreground">
                  {step}
                </span>
                {i < PIPELINE.length - 1 ? (
                  <ArrowRight className="size-4 text-teal" aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section className="surface-card p-5 sm:p-6" aria-label="Model selection">
          <h2 className="text-xl font-semibold text-foreground">Model Selection</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {MODELS.map((m) => (
              <div
                key={m.name}
                className={`rounded-xl border p-5 ${m.preferred ? "border-teal/40 bg-teal-soft" : "border-border bg-secondary/50"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{m.name}</h3>
                  {m.preferred ? (
                    <span className="rounded-full bg-teal px-3 py-1 text-xs font-bold text-teal-foreground uppercase">
                      Preferred
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">{m.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6" aria-label="Model metrics">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">Performance</h2>
            <DemoBadge label="Prototype / Demo Metrics" />
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-4">
            {METRICS.map((m) => (
              <div key={m.label} className="rounded-xl border border-border bg-secondary/50 p-4">
                <dt className="text-sm font-medium text-muted-foreground">{m.label}</dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">{m.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </AppShell>
  );
}
