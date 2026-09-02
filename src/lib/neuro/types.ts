export type SignalType = "relaxed" | "single_twitch" | "double_twitch" | "long_twitch";

export type ActionType = "none" | "basic_need" | "call_caregiver" | "emergency";

export type AlertType = "basic_need" | "caregiver_request" | "emergency";

export type AlertStatus = "new" | "acknowledged" | "responding" | "resolved";

export type DeviceStatus = "connected" | "degraded" | "disconnected";

export interface Patient {
  id: string;
  name: string;
  room: string;
  status: string;
  caregiver: string;
}

export interface Caregiver {
  id: string;
  name: string;
  role: "patient" | "caregiver" | "administrator";
  shift: string;
}

export interface SignalEvent {
  id: string;
  signalType: SignalType;
  confidence: number;
  timestamp: string;
  action: ActionType;
  status: AlertStatus;
}

export interface Alert {
  id: string;
  type: AlertType;
  patient: string;
  room: string;
  signalType: SignalType;
  confidence: number;
  timestamp: string;
  status: AlertStatus;
  label: string;
  need?: string | undefined;
  acknowledgedAt?: string | undefined;
  resolvedAt?: string | undefined;
  responseSeconds?: number | undefined;
}

export interface Device {
  id: string;
  name: string;
  detail: string;
  status: DeviceStatus;
  lastCommunication: string;
  quality: number;
  stream: string;
}

export interface Prediction {
  probabilities: Record<SignalType, number>;
  predicted: SignalType;
  confidence: number;
  action: ActionType;
}

export interface NeedRequest {
  id: string;
  need: string;
  timestamp: string;
  status: AlertStatus;
}

export const SIGNAL_LABEL: Record<SignalType, string> = {
  relaxed: "Relaxed",
  single_twitch: "Single Twitch",
  double_twitch: "Double Twitch",
  long_twitch: "Long Twitch",
};

export const ACTION_LABEL: Record<ActionType, string> = {
  none: "No Action",
  basic_need: "Basic Need",
  call_caregiver: "Call Caregiver",
  emergency: "Emergency Alert",
};

export const BASIC_NEEDS = [
  { id: "water", label: "Water", icon: "droplet" },
  { id: "food", label: "Food", icon: "utensils" },
  { id: "medication", label: "Medication", icon: "pill" },
  { id: "washroom", label: "Washroom", icon: "toilet" },
  { id: "position", label: "Change Position", icon: "bed" },
  { id: "pain", label: "Pain / Discomfort", icon: "alert" },
  { id: "other", label: "Other", icon: "more" },
] as const;
