import { Wifi, WifiOff, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface ConnectionStatusIndicatorProps {
  status: "online" | "offline" | "checking";
  onRetry?: () => void;
}

export function ConnectionStatusIndicator({ status, onRetry }: ConnectionStatusIndicatorProps) {
  const [isNavigatorOnline, setIsNavigatorOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const goOnline = () => setIsNavigatorOnline(true);
    const goOffline = () => setIsNavigatorOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount(c => c + 1);
    onRetry?.();
  }, [onRetry]);

  if (!isNavigatorOnline) return null;
  if (status === "online") return null;

  const isServerDown = status === "offline";
  const isChecking = status === "checking";

  const getConfig = () => {
    if (isServerDown) {
      return {
        bg: "#7f1d1d",
        borderColor: "#991b1b",
        icon: <AlertCircle className="h-4 w-4 text-red-200" />,
        titleColor: "#fef2f2",
        descColor: "#fca5a5",
        badgeBg: "#991b1b",
        badgeColor: "#fca5a5",
        title: "Server unavailable",
        desc: "Cannot reach FileNova servers. Please try again later.",
        badge: "SERVER DOWN",
      };
    }
    if (isChecking) {
      return {
        bg: "#1e40af",
        borderColor: "#3b82f6",
        icon: <AlertCircle className="h-4 w-4 text-blue-200" />,
        titleColor: "#bfdbfe",
        descColor: "#93c5fd",
        badgeBg: "#3b82f6",
        badgeColor: "#dbeafe",
        title: "Checking connection...",
        desc: "Verifying server connectivity",
        badge: "CONNECTING",
      };
    }
    return null;
  };

  const config = getConfig();
  if (!config) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99998,
        background: config.bg,
        borderBottom: `1px solid ${config.borderColor}`,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "sans-serif",
      }}
    >
      {config.icon}
      <div style={{ flex: 1 }}>
        <span style={{ color: config.titleColor, fontSize: 13, fontWeight: 600 }}>
          {config.title}
        </span>
        <span style={{ color: config.descColor, fontSize: 12, marginLeft: 8 }}>
          {config.desc}
        </span>
      </div>
      <button
        onClick={handleRetry}
        style={{
          background: config.badgeBg,
          color: config.badgeColor,
          border: "none",
          padding: "4px 12px",
          borderRadius: 99,
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <RefreshCw className="h-3 w-3" />
        Retry
      </button>
      <div
        style={{
          background: config.badgeBg,
          color: config.badgeColor,
          padding: "2px 10px",
          borderRadius: 99,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
      >
        {config.badge}
      </div>
    </div>
  );
}