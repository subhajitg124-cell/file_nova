import { Wifi, WifiOff, AlertCircle } from "lucide-react";

interface ConnectionStatusIndicatorProps {
  status: "online" | "offline" | "checking";
}

export function ConnectionStatusIndicator({ status }: ConnectionStatusIndicatorProps) {
  if (status === "online") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: status === "checking" ? 0 : 52,
        left: 0,
        right: 0,
        zIndex: 99998,
        background: status === "checking" ? "#1e40af" : "#78350f",
        borderBottom: "1px solid",
        borderColor: status === "checking" ? "#3b82f6" : "#92400e",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "sans-serif",
      }}
    >
      {status === "checking" ? (
        <AlertCircle className="h-4 w-4 text-blue-200" />
      ) : (
        <WifiOff className="h-4 w-4 text-orange-200" />
      )}
      <div style={{ flex: 1 }}>
        <span style={{ color: status === "checking" ? "#bfdbfe" : "#fef3c7", fontSize: 13, fontWeight: 600 }}>
          {status === "checking" ? "Checking connection..." : "Server unavailable"}
        </span>
        <span
          style={{ color: status === "checking" ? "#93c5fd" : "#d97706", fontSize: 12, marginLeft: 8 }}
        >
          {status === "checking" 
            ? "Verifying backend connectivity"
            : "Some features may be limited. Please try again later."
          }
        </span>
      </div>
      <div
        style={{
          background: status === "checking" ? "#3b82f6" : "#92400e",
          color: status === "checking" ? "#dbeafe" : "#fbbf24",
          padding: "2px 10px",
          borderRadius: 99,
          fontSize: 11,
        }}
      >
        {status === "checking" ? "CONNECTING" : "OFFLINE"}
      </div>
    </div>
  );
}