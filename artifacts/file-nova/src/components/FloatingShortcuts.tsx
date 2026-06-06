import React, { useState } from "react";
import { 
  Phone, 
  HelpCircle, 
  Bot, 
  MessageCircle, 
  Mail,
  BookOpen,
  FolderOpen,
  Gift
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/lib/i18n";

export function FloatingShortcuts() {
  const { user } = useAuthStore();
  const { tText } = useTranslation();
  const isPremiumUser = !!(user?.premiumTier === 'basic' || user?.premiumTier === 'pro' || user?.premiumTier === 'elite');

  const shortcuts = [
    {
      id: "ai",
      icon: <Bot className="h-5.5 w-5.5" />,
      label: tText("AI Assistant"),
      color: "#8b5cf6",
      onClick: () => {
        const event = new CustomEvent("openAIAssistant");
        window.dispatchEvent(event);
      },
    },
    {
      id: "blog",
      icon: <BookOpen className="h-5.5 w-5.5" />,
      label: tText("Blogs"),
      color: "#f59e0b",
      onClick: () => window.open("/blog", "_self"),
    },
    {
      id: "resources",
      icon: <FolderOpen className="h-5.5 w-5.5" />,
      label: tText("Resources"),
      color: "#14b8a6",
      onClick: () => window.open("/resources", "_self"),
    },
    {
      id: "help",
      icon: <HelpCircle className="h-5.5 w-5.5" />,
      label: tText("Help Center"),
      color: "#3b82f6",
      onClick: () => window.open("/contact", "_self"),
    },
    {
      id: "deals",
      icon: <Gift className="h-5.5 w-5.5" />,
      label: tText("CSC Operator Toolkit"),
      color: "#5046e4",
      badge: 3,
      onClick: () => window.open("/resources?tab=operator", "_self"),
    },
    {
      id: "email",
      icon: <Mail className="h-5.5 w-5.5" />,
      label: tText("Email Support"),
      color: "#0ea5e9",
      onClick: () => window.open("mailto:subhajiteditz90@gmail.com?subject=FileNova Support Request&body=Hi, I need help with..."),
    },
    ...(isPremiumUser ? [
      {
        id: "whatsapp",
        icon: <MessageCircle className="h-5.5 w-5.5 fill-current" />,
        label: tText("WhatsApp Support"),
        color: "#10b981",
        onClick: () => window.open("https://wa.me/919064560741?text=Hi! I am a FileNova Premium user and need assistance with..."),
      },
      {
        id: "phone",
        icon: <Phone className="h-5.5 w-5.5" />,
        label: tText("Call Support"),
        color: "#ef4444",
        onClick: () => window.open("tel:+919064560741"),
      }
    ] : [])
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 80, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 9999 }}>
      {shortcuts.map((s, i) => (
        <div key={s.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {hoveredIndex === i && (
            <div className="fab-tooltip">
              {s.label}
              <span className="fab-arrow" />
            </div>
          )}
          <button
            aria-label={s.label}
            title={s.label}
            className="fab-btn"
            style={{ background: hoveredIndex === i ? '#4338ca' : s.color }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={s.onClick}
          >
            {s.icon}
            {s.badge && s.badge > 0 && <div className="fab-badge">{s.badge}</div>}
          </button>
        </div>
      ))}
    </div>
  );
}
