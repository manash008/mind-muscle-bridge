import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  ACTION_FOR_SIGNAL,
  DEMO_CAREGIVER,
  DEMO_PATIENT,
  buildAlert,
  getAlertHistory,
  getDeviceStatus,
  getPrediction,
  realtimeChannel,
  sendCaregiverAlert,
  sendEmergencyAlert,
  type NeuroEvent,
} from "./mockNeuroBridgeService";
import {
  SIGNAL_LABEL,
  type Alert,
  type AlertStatus,
  type Device,
  type DeviceStatus,
  type Prediction,
  type SignalType,
} from "./types";

export interface Settings {
  demoMode: boolean;
  monitoring: boolean;
  detectionThreshold: number; // 0-1 amplitude
  cooldownSeconds: number;
  confidenceThreshold: number; // 0-1
  soundNotifications: boolean;
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  darkMode: boolean;
  mapping: Record<SignalType, string>;
}

const DEFAULT_SETTINGS: Settings = {
  demoMode: true,
  monitoring: true,
  detectionThreshold: 0.45,
  cooldownSeconds: 3,
  confidenceThreshold: 0.7,
  soundNotifications: true,
  largeText: false,
  highContrast: false,
  reduceMotion: false,
  darkMode: false,
  mapping: {
    relaxed: "none",
    single_twitch: "basic_need",
    double_twitch: "call_caregiver",
    long_twitch: "emergency",
  },
};

interface NeuroContextValue {
  patient: typeof DEMO_PATIENT;
  caregiver: typeof DEMO_CAREGIVER;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  devices: Device[];
  setDeviceStatus: (id: string, status: DeviceStatus) => void;
  retryDevice: (id: string) => void;
  currentSignal: SignalType;
  prediction: Prediction;
  alerts: Alert[];
  activeEmergency: Alert | undefined;
  activeCaregiverRequest: Alert | undefined;
  needPanelOpen: boolean;
  setNeedPanelOpen: (open: boolean) => void;
  responseTimer: number;
  simulate: (signal: SignalType) => void;
  selectNeed: (need: string) => void;
  acknowledgeAlert: (id: string) => void;
  respondToAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  smartDevices: Record<string, boolean>;
  toggleSmartDevice: (id: string) => void;
  systemOnline: boolean;
  lastEvent: NeuroEvent | undefined;
}

const NeuroContext = createContext<NeuroContextValue | null>(null);

export function useNeuro() {
  const ctx = useContext(NeuroContext);
  if (!ctx) throw new Error("useNeuro must be used inside <NeuroProvider>");
  return ctx;
}

export function NeuroProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentSignal, setCurrentSignal] = useState<SignalType>("relaxed");
  const [prediction, setPrediction] = useState<Prediction>(() => getPrediction("relaxed", 0.98));
  const [needPanelOpen, setNeedPanelOpen] = useState(false);
  const [responseTimer, setResponseTimer] = useState(0);
  const [lastEvent, setLastEvent] = useState<NeuroEvent | undefined>(undefined);
  const [smartDevices, setSmartDevices] = useState<Record<string, boolean>>({
    light: false,
    fan: false,
    alarm: false,
    other: false,
  });
  const cooldownRef = useRef<{ signal: SignalType; at: number } | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial data load through the service layer.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const [d, h] = await Promise.all([getDeviceStatus(), getAlertHistory()]);
      if (!alive) return;
      setDevices(d);
      setAlerts(h);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Accessibility preferences applied to the document.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", settings.darkMode);
    root.classList.toggle("text-large", settings.largeText);
    root.classList.toggle("reduce-motion", settings.reduceMotion);
    root.classList.toggle("contrast-more", settings.highContrast);
  }, [settings.darkMode, settings.largeText, settings.reduceMotion, settings.highContrast]);

  const activeEmergency = useMemo(
    () => alerts.find((a) => a.type === "emergency" && a.status !== "resolved"),
    [alerts],
  );
  const activeCaregiverRequest = useMemo(
    () => alerts.find((a) => a.type === "caregiver_request" && a.status !== "resolved"),
    [alerts],
  );

  // Response timer for an accepted caregiver request.
  useEffect(() => {
    if (!activeCaregiverRequest || activeCaregiverRequest.status === "new") {
      setResponseTimer(0);
      return;
    }
    setResponseTimer(0);
    const interval = setInterval(() => setResponseTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [activeCaregiverRequest?.id, activeCaregiverRequest?.status]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const setDeviceStatus = useCallback((id: string, status: DeviceStatus) => {
    setDevices((list) =>
      list.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              quality: status === "connected" ? 95 : status === "degraded" ? 48 : 0,
              lastCommunication: status === "disconnected" ? "no response" : "just now",
              stream:
                status === "connected"
                  ? d.stream
                  : status === "degraded"
                    ? "Unstable stream"
                    : "No data",
            }
          : d,
      ),
    );
  }, []);

  const retryDevice = useCallback(
    (id: string) => {
      setDeviceStatus(id, "connected");
      toast.success("Connection restored", { description: `${id.toUpperCase()} is reporting again.` });
    },
    [setDeviceStatus],
  );

  const systemOnline = devices.every((d) => d.status === "connected");

  const pushAlert = useCallback((alert: Alert) => {
    setAlerts((list) => [alert, ...list]);
  }, []);

  const handleEvent = useCallback(
    (event: NeuroEvent) => {
      setLastEvent(event);
      setCurrentSignal(event.signal);
      setPrediction(getPrediction(event.signal, event.confidence));

      if (event.signal === "relaxed") return;

      if (event.confidence < settings.confidenceThreshold) {
        toast.warning("Low prediction confidence", {
          description: `${SIGNAL_LABEL[event.signal]} detected at ${(event.confidence * 100).toFixed(
            0,
          )}% — below the ${(settings.confidenceThreshold * 100).toFixed(0)}% threshold. No action triggered.`,
        });
        return;
      }

      const action = ACTION_FOR_SIGNAL[event.signal];
      if (action === "basic_need") {
        setNeedPanelOpen(true);
        toast("Basic Need Detected", {
          description: "Single twitch confirmed. Waiting for need selection.",
        });
      } else if (action === "call_caregiver") {
        const alert = buildAlert({
          type: "caregiver_request",
          signalType: event.signal,
          confidence: event.confidence,
          label: "Caregiver Request",
        });
        pushAlert(alert);
        void sendCaregiverAlert(alert);
        toast.info("Caregiver Requested", {
          description: "Patient has requested caregiver assistance.",
        });
      } else if (action === "emergency") {
        const alert = buildAlert({
          type: "emergency",
          signalType: event.signal,
          confidence: event.confidence,
          label: "Emergency Alert",
        });
        pushAlert(alert);
        void sendEmergencyAlert(alert).then((res) => {
          toast.error("EMERGENCY ALERT", { description: res.message, duration: 8000 });
        });
      }
    },
    [pushAlert, settings.confidenceThreshold],
  );

  // Mock real-time channel — replace with a WebSocket subscription later.
  useEffect(() => realtimeChannel.subscribe(handleEvent) as () => void, [handleEvent]);

  const simulate = useCallback(
    (signal: SignalType) => {
      if (!settings.monitoring) {
        toast.warning("Monitoring is paused", { description: "Start monitoring to detect signals." });
        return;
      }
      const emgDown = devices.some((d) => d.id === "emg" && d.status === "disconnected");
      if (emgDown) {
        toast.error("EMG Sensor Disconnected", {
          description: "Check sensor connection before continuing.",
        });
        return;
      }
      const now = Date.now();
      const cd = cooldownRef.current;
      if (
        signal !== "relaxed" &&
        cd &&
        cd.signal === signal &&
        now - cd.at < settings.cooldownSeconds * 1000
      ) {
        toast("Cooldown active", {
          description: `Duplicate ${SIGNAL_LABEL[signal]} suppressed for ${settings.cooldownSeconds}s.`,
        });
        return;
      }
      cooldownRef.current = { signal, at: now };

      const confidence =
        signal === "relaxed" ? 0.98 : Number((0.9 + Math.random() * 0.09).toFixed(4));
      realtimeChannel.emit(signal, confidence);

      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      if (signal !== "relaxed") {
        resetTimeoutRef.current = setTimeout(() => {
          setCurrentSignal("relaxed");
          setPrediction(getPrediction("relaxed", 0.98));
        }, 4000);
      }
    },
    [devices, settings.cooldownSeconds, settings.monitoring],
  );

  const selectNeed = useCallback(
    (need: string) => {
      const alert = buildAlert({
        type: "basic_need",
        signalType: "single_twitch",
        confidence: prediction.confidence,
        label: `Basic Need – ${need}`,
        need,
      });
      pushAlert(alert);
      setNeedPanelOpen(false);
      toast.success(`Patient requested: ${need}`, {
        description: new Date().toLocaleTimeString(),
      });
    },
    [prediction.confidence, pushAlert],
  );

  const setStatus = useCallback((id: string, status: AlertStatus, seconds?: number) => {
    setAlerts((list) =>
      list.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              ...(status === "acknowledged" ? { acknowledgedAt: new Date().toISOString() } : {}),
              ...(status === "resolved"
                ? { resolvedAt: new Date().toISOString(), responseSeconds: seconds ?? a.responseSeconds }
                : {}),
            }
          : a,
      ),
    );
  }, []);

  const acknowledgeAlert = useCallback(
    (id: string) => {
      setStatus(id, "acknowledged");
      toast.success("Request acknowledged");
    },
    [setStatus],
  );

  const respondToAlert = useCallback(
    (id: string) => {
      setStatus(id, "responding");
      toast.info("Caregiver is responding to the request.");
    },
    [setStatus],
  );

  const resolveAlert = useCallback(
    (id: string) => {
      setStatus(id, "resolved");
      toast.success("Marked as resolved");
    },
    [setStatus],
  );

  const dismissAlert = useCallback(
    (id: string) => {
      setStatus(id, "resolved");
      toast("Request dismissed");
    },
    [setStatus],
  );

  const toggleSmartDevice = useCallback((id: string) => {
    setSmartDevices((s) => {
      const next = { ...s, [id]: !s[id] };
      toast(`${id.charAt(0).toUpperCase() + id.slice(1)} turned ${next[id] ? "ON" : "OFF"}`, {
        description: "Simulated device — Demo Mode",
      });
      return next;
    });
  }, []);

  const value: NeuroContextValue = {
    patient: DEMO_PATIENT,
    caregiver: DEMO_CAREGIVER,
    settings,
    updateSettings,
    devices,
    setDeviceStatus,
    retryDevice,
    currentSignal,
    prediction,
    alerts,
    activeEmergency,
    activeCaregiverRequest,
    needPanelOpen,
    setNeedPanelOpen,
    responseTimer,
    simulate,
    selectNeed,
    acknowledgeAlert,
    respondToAlert,
    resolveAlert,
    dismissAlert,
    smartDevices,
    toggleSmartDevice,
    systemOnline,
    lastEvent,
  };

  return <NeuroContext.Provider value={value}>{children}</NeuroContext.Provider>;
}
