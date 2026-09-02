import { useNeuro } from "@/lib/neuro/store";
import { ACTION_LABEL, SIGNAL_LABEL, type SignalType } from "@/lib/neuro/types";
import { cn } from "@/lib/utils";

const ORDER: SignalType[] = ["relaxed", "single_twitch", "double_twitch", "long_twitch"];

export function AIClassification() {
  const { prediction } = useNeuro();

  return (
    <section className="surface-card p-5 sm:p-6" aria-label="AI signal classification">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">AI Signal Classification</h2>
        <span className="rounded-full bg-info-soft px-3 py-1 text-xs font-semibold text-primary uppercase">
          Random Forest
        </span>
      </div>

      <ul className="mt-5 space-y-4">
        {ORDER.map((signal) => {
          const p = prediction.probabilities[signal] ?? 0;
          const active = prediction.predicted === signal;
          return (
            <li key={signal}>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={cn(
                    "text-base font-semibold",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {SIGNAL_LABEL[signal]}
                  {active ? <span className="sr-only"> (current prediction)</span> : null}
                </span>
                <span className="text-base font-bold tabular-nums text-foreground">
                  {(p * 100).toFixed(1)}%
                </span>
              </div>
              <div
                className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={`${SIGNAL_LABEL[signal]} probability`}
                aria-valuenow={Math.round(p * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    active
                      ? signal === "long_twitch"
                        ? "bg-emergency"
                        : signal === "double_twitch"
                          ? "bg-warning"
                          : "bg-primary"
                      : "bg-border",
                  )}
                  style={{ width: `${Math.max(p * 100, 1)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <dl className="mt-6 grid gap-4 rounded-xl bg-secondary p-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Current Prediction
          </dt>
          <dd className="mt-1 text-lg font-bold text-foreground">
            {SIGNAL_LABEL[prediction.predicted].toUpperCase()}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Confidence
          </dt>
          <dd className="mt-1 text-lg font-bold text-foreground tabular-nums">
            {(prediction.confidence * 100).toFixed(0)}%
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Action
          </dt>
          <dd className="mt-1 text-lg font-bold text-foreground">
            {ACTION_LABEL[prediction.action].toUpperCase()}
          </dd>
        </div>
      </dl>
    </section>
  );
}
