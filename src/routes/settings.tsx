import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/neuro/AppShell";
import { DemoBadge, SectionHeading } from "@/components/neuro/primitives";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useNeuro } from "@/lib/neuro/store";
import { ACTION_LABEL, SIGNAL_LABEL, type SignalType } from "@/lib/neuro/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NeuroBridge" },
      {
        name: "description",
        content:
          "Configure signal thresholds, cooldown, notifications, command mapping and accessibility preferences.",
      },
      { property: "og:title", content: "Settings — NeuroBridge" },
      {
        property: "og:description",
        content: "Tune detection sensitivity and accessibility options.",
      },
    ],
  }),
  component: SettingsPage,
});

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-secondary/50 p-4">
      <div className="min-w-48">
        <p className="text-base font-semibold text-foreground">{label}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-5 sm:p-6" aria-label={title}>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

const SIGNALS: SignalType[] = ["relaxed", "single_twitch", "double_twitch", "long_twitch"];

function SettingsPage() {
  const { settings, updateSettings, patient, caregiver } = useNeuro();

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <SectionHeading
          title="Settings"
          description="Prototype configuration for detection, notifications and accessibility."
          actions={<DemoBadge label="Prototype Configuration" />}
        />

        <Card title="Patient">
          <Row label="Patient" description={`${patient.id} · ${patient.room}`}>
            <span className="text-base font-semibold text-foreground">{patient.name}</span>
          </Row>
        </Card>

        <Card title="Caregiver">
          <Row label="Assigned caregiver" description={caregiver.shift}>
            <span className="text-base font-semibold text-foreground">{caregiver.name}</span>
          </Row>
        </Card>

        <Card title="Signal">
          <Row
            label="Detection threshold"
            description={`Amplitude required to register activity — ${Math.round(settings.detectionThreshold * 100)}%`}
          >
            <Slider
              className="w-56"
              min={10}
              max={90}
              step={5}
              value={[Math.round(settings.detectionThreshold * 100)]}
              onValueChange={([v]) => updateSettings({ detectionThreshold: (v ?? 45) / 100 })}
              aria-label="Detection threshold"
            />
          </Row>
          <Row
            label="Cooldown duration"
            description={`Ignore repeat triggers for ${settings.cooldownSeconds}s`}
          >
            <Slider
              className="w-56"
              min={1}
              max={15}
              step={1}
              value={[settings.cooldownSeconds]}
              onValueChange={([v]) => updateSettings({ cooldownSeconds: v ?? 3 })}
              aria-label="Cooldown duration"
            />
          </Row>
          <Row
            label="Confidence threshold"
            description={`Commands below ${Math.round(settings.confidenceThreshold * 100)}% confidence are rejected`}
          >
            <Slider
              className="w-56"
              min={50}
              max={99}
              step={1}
              value={[Math.round(settings.confidenceThreshold * 100)]}
              onValueChange={([v]) => updateSettings({ confidenceThreshold: (v ?? 70) / 100 })}
              aria-label="Confidence threshold"
            />
          </Row>
          <div className="rounded-xl border border-border bg-secondary/50 p-4">
            <p className="text-base font-semibold text-foreground">Command mapping</p>
            <ul className="mt-3 space-y-2">
              {SIGNALS.map((s) => (
                <li key={s} className="flex items-center justify-between gap-3 text-base">
                  <span className="font-medium text-foreground">{SIGNAL_LABEL[s]}</span>
                  <span className="text-muted-foreground">
                    {
                      ACTION_LABEL[
                        (settings.mapping[s] ?? "none") as keyof typeof ACTION_LABEL
                      ]
                    }
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Notifications">
          <Row label="Sound notifications" description="Audible cue for new alerts">
            <Switch
              checked={settings.soundNotifications}
              onCheckedChange={(v) => updateSettings({ soundNotifications: v })}
              aria-label="Sound notifications"
            />
          </Row>
        </Card>

        <Card title="Device">
          <Row label="Demo Mode" description="Simulated signals instead of live hardware">
            <Switch
              checked={settings.demoMode}
              onCheckedChange={(v) => updateSettings({ demoMode: v })}
              aria-label="Demo mode"
            />
          </Row>
          <Row label="Monitoring" description="Stream and classify incoming EMG samples">
            <Switch
              checked={settings.monitoring}
              onCheckedChange={(v) => updateSettings({ monitoring: v })}
              aria-label="Monitoring"
            />
          </Row>
        </Card>

        <Card title="Accessibility">
          {(
            [
              ["largeText", "Large Text", "Increase base font size across the app"],
              ["highContrast", "High Contrast", "Stronger contrast for low-vision users"],
              ["reduceAnimation", "Reduce Animation", "Minimise motion and pulsing effects"],
              ["darkMode", "Dark Mode", "Low-light friendly colour scheme"],
              ["vibration", "Vibration / visual notification", "Non-audio alert feedback"],
            ] as const
          ).map(([key, label, description]) => {
            const checked =
              key === "reduceAnimation"
                ? settings.reduceMotion
                : key === "vibration"
                  ? settings.soundNotifications
                  : Boolean(settings[key as keyof typeof settings]);
            return (
              <Row key={key} label={label} description={description}>
                <Switch
                  checked={checked}
                  onCheckedChange={(v) =>
                    updateSettings(
                      key === "reduceAnimation"
                        ? { reduceMotion: v }
                        : key === "vibration"
                          ? { soundNotifications: v }
                          : ({ [key]: v } as Record<string, boolean>),
                    )
                  }
                  aria-label={label}
                />
              </Row>
            );
          })}
        </Card>

        <p className="rounded-xl border border-warning/40 bg-warning-soft p-4 text-base font-medium text-warning-foreground">
          Prototype configuration — settings are stored in memory for this demo session only.
        </p>
      </div>
    </AppShell>
  );
}
