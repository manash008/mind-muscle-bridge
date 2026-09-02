import { Cpu, Network, Waves, BrainCircuit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/neuro/primitives";
import { useNeuro } from "@/lib/neuro/store";
import type { Device } from "@/lib/neuro/types";

const ICONS: Record<string, typeof Cpu> = {
  emg: Waves,
  arduino: Cpu,
  model: BrainCircuit,
  network: Network,
};

const STATUS_TEXT: Record<Device["status"], string> = {
  connected: "Connected",
  degraded: "Unstable",
  disconnected: "Disconnected",
};

export function DeviceStatusPanel({ detailed = false }: { detailed?: boolean }) {
  const { devices, retryDevice, setDeviceStatus } = useNeuro();

  return (
    <section className="surface-card p-5 sm:p-6" aria-label="Device status">
      <h2 className="text-xl font-semibold text-foreground">Device & System Status</h2>
      <ul className="mt-4 space-y-3">
        {devices.map((device) => {
          const Icon = ICONS[device.id] ?? Cpu;
          return (
            <li key={device.id} className="rounded-xl border border-border bg-secondary/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-card text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-foreground">{device.name}</p>
                    <p className="text-sm text-muted-foreground">{device.detail}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <StatusDot status={device.status} />
                  {STATUS_TEXT[device.status]}
                </span>
              </div>

              {detailed ? (
                <>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-muted-foreground">Last communication</dt>
                      <dd className="font-semibold text-foreground">{device.lastCommunication}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Signal quality</dt>
                      <dd className="font-semibold text-foreground">{device.quality}%</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Data stream</dt>
                      <dd className="font-semibold text-foreground">{device.stream}</dd>
                    </div>
                  </dl>
                  {device.status !== "connected" ? (
                    <div className="mt-4 rounded-lg border border-emergency/30 bg-emergency-soft p-3">
                      <p className="text-sm font-semibold text-emergency">
                        {device.name} {device.status === "degraded" ? "signal is unstable" : "disconnected"}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        Check the connection before continuing.
                      </p>
                      <Button className="mt-3" size="lg" onClick={() => retryDevice(device.id)}>
                        Retry Connection
                      </Button>
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeviceStatus(device.id, "connected")}
                    >
                      Simulate Connected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeviceStatus(device.id, "degraded")}
                    >
                      Simulate Low Quality
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeviceStatus(device.id, "disconnected")}
                    >
                      Simulate Disconnect
                    </Button>
                  </div>
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
