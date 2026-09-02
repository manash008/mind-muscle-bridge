import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { getCurrentEMGSignal } from "@/lib/neuro/mockNeuroBridgeService";
import { useNeuro } from "@/lib/neuro/store";
import { SIGNAL_LABEL } from "@/lib/neuro/types";
import { Button } from "@/components/ui/button";
import { DemoBadge, StatusPill } from "@/components/neuro/primitives";

const POINTS = 60;

export function EMGChart({ compact = false }: { compact?: boolean }) {
  const { currentSignal, settings, updateSettings } = useNeuro();
  const [data, setData] = useState(() =>
    Array.from({ length: POINTS }, (_, i) => ({ t: i, v: 0.12 })),
  );
  const tick = useRef(0);
  const signalRef = useRef(currentSignal);
  signalRef.current = currentSignal;

  useEffect(() => {
    if (!settings.monitoring) return;
    const id = setInterval(() => {
      tick.current += 1;
      const v = getCurrentEMGSignal(signalRef.current, tick.current);
      setData((prev) => [...prev.slice(1), { t: tick.current, v: Number(v.toFixed(3)) }]);
    }, 120);
    return () => clearInterval(id);
  }, [settings.monitoring]);

  const reset = () => {
    tick.current = 0;
    setData(Array.from({ length: POINTS }, (_, i) => ({ t: i, v: 0.12 })));
  };

  return (
    <section className="surface-card p-5 sm:p-6" aria-label="Real-time EMG signal">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Real-Time EMG Signal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Signal amplitude over time · detection threshold{" "}
            {(settings.detectionThreshold * 100).toFixed(0)}%
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DemoBadge />
          <StatusPill tone={currentSignal === "relaxed" ? "teal" : "warning"}>
            {SIGNAL_LABEL[currentSignal]}
          </StatusPill>
        </div>
      </div>

      <div className={compact ? "mt-4 h-40" : "mt-5 h-64"}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="emgFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-teal)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-teal)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
            <XAxis dataKey="t" tick={false} axisLine={false} height={16} />
            <YAxis
              domain={[0, 1]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine
              y={settings.detectionThreshold}
              stroke="var(--color-warning)"
              strokeDasharray="6 6"
              label={{
                value: "Threshold",
                position: "insideTopRight",
                fill: "var(--color-warning-foreground)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--color-teal)"
              strokeWidth={2}
              fill="url(#emgFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="lg"
          onClick={() => updateSettings({ monitoring: true })}
          disabled={settings.monitoring}
        >
          Start Monitoring
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => updateSettings({ monitoring: false })}
          disabled={!settings.monitoring}
        >
          Pause Monitoring
        </Button>
        <Button size="lg" variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Simulated waveform for demonstration. This is not real patient data.
      </p>
    </section>
  );
}

/** Small inline waveform used inside the patient status card. */
export function MiniWaveform({ active }: { active: boolean }) {
  const [offset, setOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!active || !mounted) return;
    const id = setInterval(() => setOffset((o) => o + 1), 140);
    return () => clearInterval(id);
  }, [active, mounted]);
  const effectiveOffset = mounted ? offset : 0;

  const points = Array.from({ length: 48 }, (_, i) => {
    const x = (i / 47) * 300;
    const base = 24 + Math.sin((i + offset) / 2.2) * 4;
    const spike = (i + offset) % 17 === 0 ? 14 : 0;
    return `${x},${base - spike}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 300 48" className="h-14 w-full" role="img" aria-label="Live EMG waveform">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-teal)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
