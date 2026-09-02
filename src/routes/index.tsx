import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertOctagon,
  BellRing,
  BrainCircuit,
  Cpu,
  Hand,
  HeartPulse,
  Radio,
  ShieldCheck,
  Waves,
} from "lucide-react";

import { Logo } from "@/components/neuro/AppShell";
import { Disclaimer } from "@/components/neuro/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroBridge — AI-Powered Assistive Communication" },
      {
        name: "description",
        content:
          "NeuroBridge turns small muscle twitches into clear caregiver actions using EMG sensing, Arduino and an AI classifier.",
      },
      { property: "og:title", content: "NeuroBridge — AI-Powered Assistive Communication" },
      {
        property: "og:description",
        content: "Small Signals. Greater Independence. EMG + AI assistive communication.",
      },
    ],
  }),
  component: Landing,
});

const PIPELINE = [
  { label: "Patient", icon: HeartPulse },
  { label: "EMG Sensor", icon: Waves },
  { label: "Arduino", icon: Cpu },
  { label: "AI Model", icon: BrainCircuit },
  { label: "Caregiver", icon: Radio },
];

const SOLUTION = [
  { title: "Detect", text: "EMG electrodes capture tiny muscle activity from a single site." },
  { title: "Process", text: "Arduino streams samples; filtering removes noise and drift." },
  { title: "Classify", text: "The AI model recognises the twitch pattern with a confidence score." },
  { title: "Respond", text: "The matched command reaches the caregiver dashboard instantly." },
];

const SIGNALS = [
  {
    signal: "Relaxed",
    action: "No Action",
    text: "Baseline muscle activity. The system stays quiet.",
    icon: Activity,
    tone: "border-border bg-card",
    accent: "text-muted-foreground",
  },
  {
    signal: "Single Twitch",
    action: "Basic Need",
    text: "Opens the basic needs panel: water, food, medication and more.",
    icon: Hand,
    tone: "border-teal/30 bg-teal-soft",
    accent: "text-teal",
    cta: "View Basic Needs",
  },
  {
    signal: "Double Twitch",
    action: "Call Caregiver",
    text: "Sends a direct caregiver request with a response timer.",
    icon: BellRing,
    tone: "border-primary/30 bg-info-soft",
    accent: "text-primary",
  },
  {
    signal: "Long Twitch",
    action: "Emergency",
    text: "Raises a prominent emergency alert to the assigned caregiver.",
    icon: AlertOctagon,
    tone: "border-emergency/40 bg-emergency-soft",
    accent: "text-emergency",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <Logo />
          <Button asChild size="lg">
            <Link to="/dashboard">Open Caregiver Dashboard</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-info-soft px-3 py-1 text-sm font-semibold text-primary">
              <ShieldCheck className="size-4" aria-hidden="true" />
              AI + EMG + Assistive Technology
            </span>
            <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-6xl">
              NeuroBridge
            </h1>
            <p className="mt-4 text-xl font-semibold text-primary sm:text-2xl">
              AI-Powered Assistive Communication for Greater Independence
            </p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              NeuroBridge reads faint EMG muscle signals, classifies them with a machine learning
              model, and turns each pattern into a clear, confirmed action for the caregiver — so
              communication never depends on physical strength.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-h-14 px-7 text-base">
                <Link to="/dashboard">Open Caregiver Dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-14 px-7 text-base">
                <a href="#how-it-works">How NeuroBridge Works</a>
              </Button>
            </div>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Signal path
            </p>
            <ol className="mt-6 space-y-3">
              {PIPELINE.map(({ label, icon: Icon }, i) => (
                <li key={label}>
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-secondary/50 p-4">
                    <span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-base font-semibold text-foreground">{label}</span>
                  </div>
                  {i < PIPELINE.length - 1 ? (
                    <div className="ml-9 h-6 w-0.5 signal-line bg-teal/50" aria-hidden="true" />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Problem */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Communication should never depend on physical strength.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              People living with severe paralysis often retain only the smallest voluntary muscle
              activity. Call buttons, touchscreens and speech interfaces assume a level of movement
              they no longer have — leaving basic needs unspoken and emergencies unheard.
            </p>
          </div>
        </section>

        {/* Solution */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-14 lg:py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Small Movement. Meaningful Action.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
              A four-stage pipeline converts a twitch into a caregiver-ready command.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SOLUTION.map((s, i) => (
              <div key={s.title} className="surface-card relative p-6">
                <span className="text-sm font-bold text-teal">Step {i + 1}</span>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Signals */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14 lg:py-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Four Signals. Four States.
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
                Each twitch pattern maps to one unambiguous action, confirmed before it is sent.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {SIGNALS.map(({ signal, action, text, icon: Icon, tone, accent, cta }) => (
                <div key={signal} className={`rounded-2xl border p-6 shadow-sm ${tone}`}>
                  <Icon className={`size-8 ${accent}`} aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-semibold text-foreground">{signal}</h3>
                  <p className={`mt-1 text-base font-bold ${accent}`}>{action}</p>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{text}</p>
                  {cta ? (
                    <Button asChild variant="outline" className="mt-4 min-h-11 w-full">
                      <Link to="/communication">{cta}</Link>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            Small Signals. Greater Independence.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="min-h-14 px-7 text-base">
              <Link to="/dashboard">Open Caregiver Dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="min-h-14 px-7 text-base">
              <Link to="/communication">Patient Communication Board</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-8">
          <Disclaimer />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Privacy: biosignal data is sensitive health information. In a production deployment all
            EMG data would be encrypted in transit and at rest, with role-based access for patient,
            caregiver and administrator. This demo stores nothing.
          </p>
        </div>
      </footer>
    </div>
  );
}
