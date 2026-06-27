import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, 
  HelpCircle, 
  Bot, 
  MessageCircle, 
  Mail,
  BookOpen,
  FolderOpen,
  Gift,
  Sun,
  Moon,
  X,
  Zap,
  Percent,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/hooks/useTheme";

export function FloatingShortcuts() {
  const { user } = useAuthStore();
  const { tText } = useTranslation();
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPremiumUser = !!(user?.premiumTier === 'basic' || user?.premiumTier === 'pro' || user?.premiumTier === 'elite');

  // Close when clicking outside on desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (route: string, isInternal: boolean, callback?: () => void) => {
    setIsOpen(false);
    if (callback) {
      callback();
    } else if (isInternal) {
      setLocation(route);
    } else {
      window.open(route, "_blank", "noopener,noreferrer");
    }
  };

  const actions = [
    {
      id: "ai",
      icon: <Bot className="h-5 w-5 text-indigo-400" />,
      label: tText("AI Assistant"),
      description: tText("Ask questions to AI"),
      gradient: "from-indigo-500/10 to-purple-500/10 border-indigo-500/25",
      isInternal: true,
      onClick: () => {
        const event = new CustomEvent("openAIAssistant");
        window.dispatchEvent(event);
      }
    },
    {
      id: "theme",
      icon: theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-blue-400" />,
      label: theme === "dark" ? tText("Light Mode") : tText("Dark Mode"),
      description: tText("Switch visual theme"),
      gradient: "from-amber-500/10 to-orange-500/10 border-amber-500/25",
      isInternal: true,
      onClick: toggleTheme
    },
    {
      id: "blog",
      icon: <BookOpen className="h-5 w-5 text-sky-400" />,
      label: tText("Latest Blog"),
      description: tText("Tutorials & Guides"),
      gradient: "from-sky-500/10 to-blue-500/10 border-sky-500/25",
      route: "/blog",
      isInternal: true
    },
    {
      id: "student",
      icon: <Percent className="h-5 w-5 text-rose-400" />,
      label: tText("Student Offers"),
      description: tText("Flat 20% discount"),
      gradient: "from-rose-500/10 to-pink-500/10 border-rose-500/25",
      route: "/student-offer",
      isInternal: true
    },
    {
      id: "referral",
      icon: <Gift className="h-5 w-5 text-emerald-400" />,
      label: tText("Refer & Earn"),
      description: tText("Get premium free"),
      gradient: "from-emerald-500/10 to-green-500/10 border-emerald-500/25",
      route: "/referral",
      isInternal: true
    },
    {
      id: "operator",
      icon: <Briefcase className="h-5 w-5 text-yellow-400" />,
      label: tText("CSC Toolkit"),
      description: tText("Kiosk quick tools"),
      gradient: "from-yellow-500/10 to-amber-500/10 border-yellow-500/25",
      route: "/resources?tab=operator",
      isInternal: true
    },
    {
      id: "guide",
      icon: <FolderOpen className="h-5 w-5 text-teal-400" />,
      label: tText("Govt Schemes"),
      description: tText("Indian portal guides"),
      gradient: "from-teal-500/10 to-cyan-500/10 border-teal-500/25",
      route: "/resources?tab=guide",
      isInternal: true
    },
    {
      id: "help",
      icon: <HelpCircle className="h-5 w-5 text-blue-400" />,
      label: tText("Help Center"),
      description: tText("FAQs & Contact"),
      gradient: "from-blue-500/10 to-indigo-500/10 border-blue-500/25",
      route: "/contact",
      isInternal: true
    },
    {
      id: "email",
      icon: <Mail className="h-5 w-5 text-cyan-400" />,
      label: tText("Email Support"),
      description: "subhajiteditz90@gmail.com",
      gradient: "from-cyan-500/10 to-sky-500/10 border-cyan-500/25",
      route: "mailto:subhajiteditz90@gmail.com?subject=FileNova Support Request&body=Hi, I need help with...",
      isInternal: false
    },
    ...(isPremiumUser ? [
      {
        id: "whatsapp",
        icon: <MessageCircle className="h-5 w-5 text-emerald-400 fill-emerald-400/10" />,
        label: tText("WhatsApp Support"),
        description: tText("Elite priority chat"),
        gradient: "from-emerald-500/10 to-green-500/10 border-emerald-500/25",
        route: "https://wa.me/919064560741?text=Hi! I am a FileNova Premium user and need assistance with...",
        isInternal: false
      },
      {
        id: "phone",
        icon: <Phone className="h-5 w-5 text-rose-400" />,
        label: tText("Call Support"),
        description: tText("Direct operator line"),
        gradient: "from-rose-500/10 to-orange-500/10 border-rose-500/25",
        route: "tel:+919064560741",
        isInternal: false
      }
    ] : [])
  ];

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 font-sans flex items-end justify-end">
      {/* Floating Action Button (FAB) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`relative z-50 flex items-center justify-center w-14 h-14 rounded-full text-foreground cursor-pointer shadow-premium transition-all duration-300 ${
          isOpen
            ? "bg-card border border-white/20 rotate-90"
            : "bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 animate-pulse-glow"
        }`}
        aria-label="Toggle Quick shortcuts menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-foreground fill-white/10" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop (visible only when open) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 sm:hidden"
          />
        )}
      </AnimatePresence>

      {/* Shortcuts Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            // Responsive placement: bottom sheet on mobile, popover on desktop
            initial={{ 
              opacity: 0, 
              y: window.innerWidth < 640 ? 100 : -20, 
              scale: window.innerWidth < 640 ? 1 : 0.95 
            }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1 
            }}
            exit={{ 
              opacity: 0, 
              y: window.innerWidth < 640 ? 250 : -20, 
              scale: window.innerWidth < 640 ? 1 : 0.95 
            }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 w-full rounded-t-3xl border-t border-white/10 bg-background/98 backdrop-blur-2xl p-6 z-45 sm:absolute sm:bottom-18 sm:right-0 sm:left-auto sm:w-[360px] sm:rounded-3xl sm:border sm:border-white/10 sm:p-5 sm:shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Zap className="h-4.5 w-4.5 text-indigo-400 fill-indigo-400/20" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider leading-none">
                    {tText("Quick Actions")}
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {tText("Shortcuts & Toolkit")}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-card/[0.02] hover:bg-card/5 active:scale-95 transition cursor-pointer sm:hidden"
                title="Close shortcuts"
                aria-label="Close shortcuts"
              >
                <X className="w-4 h-4 text-foreground/70" />
              </button>
            </div>

            {/* Grid layout for shortcuts */}
            <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {actions.map((act) => (
                <button
                  key={act.id}
                  onClick={() => handleAction(act.route || "", act.isInternal, act.onClick)}
                  className={`flex flex-col items-start gap-2.5 p-3 rounded-2xl border bg-gradient-to-br text-left hover:scale-[1.02] active:scale-[0.98] transition duration-200 cursor-pointer overflow-hidden relative group ${act.gradient}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-9 h-9 rounded-xl bg-card/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      {act.icon}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-foreground/30 group-hover:text-foreground/60 group-hover:translate-x-0.5 transition duration-200" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-foreground/95 leading-none">
                      {act.label}
                    </span>
                    <span className="block text-[9px] font-semibold text-foreground/50 truncate max-w-[125px] mt-1 leading-none">
                      {act.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Hint footer */}
            <div className="mt-4 pt-3.5 border-t border-white/[0.05] text-center">
              <p className="text-[9px] text-muted-foreground font-bold tracking-wider uppercase leading-none">
                FileNova • {tText("Made for CSC kiosks")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
