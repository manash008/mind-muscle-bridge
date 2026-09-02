import { Activity, AlertOctagon, BellRing, Hand } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNeuro } from "@/lib/neuro/store";
import type { SignalType } from "@/lib/neuro/types";

const BUTTONS: Array<{ signal: SignalType; label: string; icon: typeof Activity }> = [
  { signal: "relaxed", label: "Simulate Relaxed", icon: Activity },
  { signal: "single_twitch", label: "Simulate Single Twitch", icon: Hand },
  { signal: "double_twitch", label: "Simulate Double Twitch", icon: BellRing },
  { signal: "long_twitch", label: "Simulate Long Twitch", icon: AlertOctagon },
];

export function SimulatorPanel() {
  const { simulate, settings, updateSettings } = useNeuro();

  return (
    <section className="surface-card p-5 sm:p-6" aria-label="Demo signal simulator">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Demo Signal Simulator</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Emits mock real-time events into the dashboard, exactly as the Arduino + Python pipeline
            will.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="demo-mode" className="text-sm font-semibold">
            Demo Mode: {settings.demoMode ? "ON" : "OFF"}
          </Label>
          <Switch
            id="demo-mode"
            checked={settings.demoMode}
            onCheckedChange={(v) => updateSettings({ demoMode: v })}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BUTTONS.map(({ signal, label, icon: Icon }) => (
          <Button
            key={signal}
            size="lg"
            variant={signal === "long_twitch" ? "destructive" : "secondary"}
            className="min-h-14 justify-start gap-3 text-base"
            disabled={!settings.demoMode}
            onClick={() => simulate(signal)}
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </Button>
        ))}
      </div>
      {!settings.demoMode ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Demo Mode is off — the dashboard is waiting for live hardware events.
        </p>
      ) : null}
    </section>
  );
}
