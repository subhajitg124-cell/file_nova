import { useEffect } from "react";
import { useActiveEvent } from "./EventProvider";

/**
 * Applies the active event's CSS variable overrides to :root.
 * Components can opt into themed colors via var(--event-primary, fallback).
 * Renders nothing — side-effect only.
 */
export function EventTheme() {
  const { activeEvent } = useActiveEvent();

  useEffect(() => {
    const root = document.documentElement;
    const cssVars = activeEvent?.theme?.cssVars;

    if (!cssVars) return;

    // Apply
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Cleanup on unmount or event change
    return () => {
      Object.keys(cssVars).forEach((key) => root.style.removeProperty(key));
    };
  }, [activeEvent]);

  return null;
}
