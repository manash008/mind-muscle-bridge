import { createFileRoute } from "@tanstack/react-router";
import {
  AlertOctagon,
  Armchair,
  BellRing,
  Droplet,
  HandHelping,
  HeartCrack,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/neuro/AppShell";
import { SectionHeading } from "@/components/neuro/primitives";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNeuro } from "@/lib/neuro/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/communication")({
  head: () => ({
    meta: [
      { title: "Communication Board — NeuroBridge" },
      {
        name: "description",
        content:
          "Large, high-contrast accessible buttons for the patient to request water, food, help, repositioning or emergency support.",
      },
      { property: "og:title", content: "Communication Board — NeuroBridge" },
      {
        property: "og:description",
        content: "Accessible one-tap communication for patients with limited movement.",
      },
    ],
  }),
  component: CommunicationPage,
});

const BUTTONS = [
  { id: "water", label: "I Need Water", icon: Droplet, kind: "need" as const },
  { id: "food", label: "I Need Food", icon: Utensils, kind: "need" as const },
  { id: "help", label: "I Need Help", icon: HandHelping, kind: "need" as const },
  { id: "position", label: "I Need to Change Position", icon: Armchair, kind: "need" as const },
  { id: "pain", label: "I'm in Pain", icon: HeartCrack, kind: "need" as const },
  { id: "caregiver", label: "Call Caregiver", icon: BellRing, kind: "caregiver" as const },
  { id: "emergency", label: "Emergency", icon: AlertOctagon, kind: "emergency" as const },
];

function CommunicationPage() {
  const { selectNeed, simulate } = useNeuro();
  const [voice, setVoice] = useState(false);

  const speak = (text: string) => {
    if (!voice || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const handle = (b: (typeof BUTTONS)[number]) => {
    if (b.kind === "emergency") simulate("long_twitch");
    else if (b.kind === "caregiver") simulate("double_twitch");
    else selectNeed(b.label.replace(/^I(?:'m| Need(?: to)?)\s*/i, "").trim() || b.label);
    speak(b.label);
    toast.success(`Sent: ${b.label}`);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionHeading
          title="Communication"
          description="Tap once to tell your caregiver what you need."
          actions={
            <div className="flex items-center gap-3">
              <Label htmlFor="voice" className="text-base font-semibold">
                Voice feedback
              </Label>
              <Switch id="voice" checked={voice} onCheckedChange={setVoice} />
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {BUTTONS.map((b) => {
            const Icon = b.icon;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handle(b)}
                className={cn(
                  "flex min-h-32 items-center gap-5 rounded-2xl border-2 p-6 text-left transition-transform hover:scale-[1.01] focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.99]",
                  b.kind === "emergency"
                    ? "border-emergency bg-emergency text-emergency-foreground sm:col-span-2"
                    : b.kind === "caregiver"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground",
                )}
              >
                <Icon className="size-12 shrink-0" aria-hidden="true" />
                <span className="text-2xl font-bold tracking-tight sm:text-3xl">{b.label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-base text-muted-foreground">
          No speech is required. Voice feedback is optional and only reads your selection aloud.
        </p>
      </div>
    </AppShell>
  );
}
