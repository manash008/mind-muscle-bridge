/**
 * Service layer for NeuroBridge.
 *
 * Every function here is the seam between the UI and the real
 * NeuroBridge pipeline:
 *
 *   EMG sensor -> Arduino Uno -> Serial -> Python signal processing
 *   -> ML model -> API / WebSocket -> this service -> dashboard
 *
 * Today these functions return simulated data (Demo Mode). To connect the
 * real system, replace the bodies with fetch()/WebSocket calls — the UI
 * components never talk to hardware directly.
 */
import type {
  Alert,
  AlertType,
  Caregiver,
  Device,
  Patient,
  Prediction,
  SignalEvent,
  SignalType,
} from "./types";

export const DEMO_PATIENT: Patient = {
  id: "NB-DEMO-001",
  name: "Demo Patient",
  room: "Room 204",
  status: "Currently Monitoring",
  caregiver: "Demo Caregiver",
};

export const DEMO_CAREGIVER: Caregiver = {
  id: "CG-001",
  name: "Demo Caregiver",
  role: "caregiver",
  shift: "Morning shift · 07:00 – 15:00",
};

export const ACTION_FOR_SIGNAL: Record<SignalType, Prediction["action"]> = {
  relaxed: "none",
  single_twitch: "basic_need",
  double_twitch: "call_caregiver",
  long_twitch: "emergency",
};

const nowIso = () => new Date().toISOString();

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function getDeviceStatus(): Promise<Device[]> {
  return [
    {
      id: "emg",
      name: "EMG Sensor",
      detail: "Muscle sensor · forearm placement",
      status: "connected",
      lastCommunication: "just now",
      quality: 94,
      stream: "Streaming @ 200 Hz",
    },
    {
      id: "arduino",
      name: "Arduino Uno",
      detail: "Serial COM3 · 115200 baud",
      status: "connected",
      lastCommunication: "just now",
      quality: 99,
      stream: "Serial active",
    },
    {
      id: "model",
      name: "AI Model",
      detail: "Random Forest classifier",
      status: "connected",
      lastCommunication: "just now",
      quality: 97,
      stream: "Inference ready",
    },
    {
      id: "network",
      name: "Network",
      detail: "Caregiver notification channel",
      status: "connected",
      lastCommunication: "just now",
      quality: 100,
      stream: "Uplink stable",
    },
  ];
}

/** One simulated EMG sample (µV-like amplitude, 0–1 normalised). */
export function getCurrentEMGSignal(state: SignalType, t: number): number {
  const noise = (Math.random() - 0.5) * 0.06;
  const baseline = 0.12 + Math.sin(t / 7) * 0.015;
  switch (state) {
    case "single_twitch":
    case "double_twitch":
      return baseline + Math.abs(Math.sin(t / 1.6)) * 0.62 + noise;
    case "long_twitch":
      return baseline + 0.68 + Math.sin(t / 3) * 0.08 + noise;
    default:
      return baseline + noise;
  }
}

export function getPrediction(state: SignalType, confidence?: number): Prediction {
  const conf = confidence ?? (state === "relaxed" ? 0.98 : 0.9 + Math.random() * 0.09);
  const rest = (1 - conf) / 3;
  const probabilities = {
    relaxed: rest,
    single_twitch: rest,
    double_twitch: rest,
    long_twitch: rest,
  } as Record<SignalType, number>;
  probabilities[state] = conf;
  return {
    probabilities,
    predicted: state,
    confidence: conf,
    action: ACTION_FOR_SIGNAL[state],
  };
}

export function buildAlert(input: {
  type: AlertType;
  signalType: SignalType;
  confidence: number;
  label: string;
  need?: string;
}): Alert {
  return {
    id: newId(input.type === "emergency" ? "EMG-ALERT" : "ALERT"),
    type: input.type,
    patient: DEMO_PATIENT.name,
    room: DEMO_PATIENT.room,
    signalType: input.signalType,
    confidence: input.confidence,
    timestamp: nowIso(),
    status: "new",
    label: input.label,
    need: input.need,
  };
}

export async function sendCaregiverAlert(alert: Alert): Promise<{ ok: true }> {
  // Real system: POST /api/alerts/caregiver
  void alert;
  return { ok: true };
}

export async function sendEmergencyAlert(alert: Alert): Promise<{ ok: true; message: string }> {
  // Prototype only — no emergency service is contacted.
  void alert;
  return { ok: true, message: "Emergency notification sent to assigned caregiver." };
}

export async function getPatientStatus() {
  return { ...DEMO_PATIENT, connection: "Stable", lastActivity: "Just now" };
}

const HISTORY_SEED_MINUTES = [22, 46, 78, 140, 205];

export async function getAlertHistory(): Promise<Alert[]> {
  const base = Date.now();
  const seeds: Array<Omit<Alert, "id" | "timestamp">> = [
    {
      type: "basic_need",
      patient: DEMO_PATIENT.name,
      room: DEMO_PATIENT.room,
      signalType: "single_twitch",
      confidence: 0.96,
      status: "resolved",
      label: "Basic Need – Water",
      need: "Water",
      responseSeconds: 42,
    },
    {
      type: "caregiver_request",
      patient: DEMO_PATIENT.name,
      room: DEMO_PATIENT.room,
      signalType: "double_twitch",
      confidence: 0.94,
      status: "acknowledged",
      label: "Caregiver Request",
      responseSeconds: 18,
    },
    {
      type: "emergency",
      patient: DEMO_PATIENT.name,
      room: DEMO_PATIENT.room,
      signalType: "long_twitch",
      confidence: 0.97,
      status: "responding",
      label: "Emergency Alert",
      responseSeconds: 9,
    },
    {
      type: "basic_need",
      patient: DEMO_PATIENT.name,
      room: DEMO_PATIENT.room,
      signalType: "single_twitch",
      confidence: 0.92,
      status: "resolved",
      label: "Basic Need – Change Position",
      need: "Change Position",
      responseSeconds: 65,
    },
    {
      type: "basic_need",
      patient: DEMO_PATIENT.name,
      room: DEMO_PATIENT.room,
      signalType: "single_twitch",
      confidence: 0.91,
      status: "resolved",
      label: "Basic Need – Medication",
      need: "Medication",
      responseSeconds: 51,
    },
  ];
  return seeds.map((s, i) => ({
    ...s,
    id: newId("SEED"),
    timestamp: new Date(base - HISTORY_SEED_MINUTES[i] * 60_000).toISOString(),
  }));
}

export function toSignalEvent(alert: Alert): SignalEvent {
  return {
    id: alert.id,
    signalType: alert.signalType,
    confidence: alert.confidence,
    timestamp: alert.timestamp,
    action:
      alert.type === "emergency"
        ? "emergency"
        : alert.type === "caregiver_request"
          ? "call_caregiver"
          : "basic_need",
    status: alert.status,
  };
}

/** Mock real-time event bus — swap for a WebSocket connection later. */
export interface NeuroEvent {
  signal: SignalType;
  confidence: number;
  timestamp: string;
  action: Prediction["action"];
}

type Listener = (event: NeuroEvent) => void;

class MockRealtimeChannel {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(signal: SignalType, confidence: number) {
    const event: NeuroEvent = {
      signal,
      confidence,
      timestamp: nowIso(),
      action: ACTION_FOR_SIGNAL[signal],
    };
    this.listeners.forEach((l) => l(event));
    return event;
  }
}

export const realtimeChannel = new MockRealtimeChannel();
