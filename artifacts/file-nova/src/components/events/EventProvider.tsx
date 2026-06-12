import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getActiveEvent, type SiteEvent } from "@/config/events";

interface EventContextValue {
  activeEvent: SiteEvent | null;
  isDismissed: boolean;
  dismiss: () => void;
}

const EventContext = createContext<EventContextValue>({
  activeEvent: null,
  isDismissed: true,
  dismiss: () => {},
});

export function useActiveEvent() {
  return useContext(EventContext);
}

const DISMISS_KEY_PREFIX = "filenova_event_dismissed_";

export function EventProvider({ children }: { children: ReactNode }) {
  const [activeEvent, setActiveEvent] = useState<SiteEvent | null>(() => getActiveEvent());
  const [isDismissed, setIsDismissed] = useState(true);

  // Poll for active event changes periodically or on date activation
  useEffect(() => {
    const checkEvent = () => {
      const current = getActiveEvent();
      setActiveEvent(current);
    };

    checkEvent();
    // Check every 30 seconds for scheduled events
    const interval = setInterval(checkEvent, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeEvent) {
      setIsDismissed(true);
      return;
    }
    const key = `${DISMISS_KEY_PREFIX}${activeEvent.id}`;
    const dismissed = localStorage.getItem(key) === "true";
    setIsDismissed(dismissed);
  }, [activeEvent]);

  const dismiss = () => {
    if (!activeEvent) return;
    localStorage.setItem(`${DISMISS_KEY_PREFIX}${activeEvent.id}`, "true");
    setIsDismissed(true);
  };

  return (
    <EventContext.Provider value={{ activeEvent, isDismissed, dismiss }}>
      {children}
    </EventContext.Provider>
  );
}
