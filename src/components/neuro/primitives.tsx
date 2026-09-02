import { cn } from "@/lib/utils";
import type { AlertStatus, DeviceStatus } from "@/lib/neuro/types";

export function StatusDot({
  status,
  pulse = true,
  className,
}: {
  status: DeviceStatus;
  pulse?: boolean;
  className?: string;
}) {
  const color =
    status === "connected"
      ? "bg-success"
      : status === "degraded"
        ? "bg-warning"
        : "bg-emergency";
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-2.5 rounded-full", color, pulse && "pulse-dot", className)}
    />
  );
}

export function StatusPill({
  status,
  children,
  tone = "neutral",
  className,
}: {
  status?: DeviceStatus;
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "emergency" | "info" | "teal";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-foreground",
    emergency: "bg-emergency-soft text-emergency",
    info: "bg-info-soft text-primary",
    teal: "bg-teal-soft text-teal",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold",
        tones[tone],
        className,
      )}
    >
      {status ? <StatusDot status={status} /> : null}
      {children}
    </span>
  );
}

const STATUS_TONE: Record<AlertStatus, "info" | "warning" | "teal" | "success"> = {
  new: "info",
  acknowledged: "warning",
  responding: "teal",
  resolved: "success",
};

const STATUS_TEXT: Record<AlertStatus, string> = {
  new: "New",
  acknowledged: "Acknowledged",
  responding: "Responding",
  resolved: "Resolved",
};

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return <StatusPill tone={STATUS_TONE[status]}>{STATUS_TEXT[status]}</StatusPill>;
}

export function SectionHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function DemoBadge({ label = "Demo / Simulated Signal" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning-soft px-3 py-1 text-xs font-semibold tracking-wide text-warning-foreground uppercase">
      {label}
    </span>
  );
}

export function Disclaimer() {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      NeuroBridge is an assistive technology prototype and is not a replacement for professional
      medical care or certified medical devices.
    </p>
  );
}
