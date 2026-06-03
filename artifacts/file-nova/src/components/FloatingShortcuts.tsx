import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageSquare, HelpCircle, Bot, X, MessageCircle, Mail } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/lib/i18n";

interface Shortcut {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  action: () => void;
  tooltip: string;
  availableFor: "all" | "premium";
}

export function FloatingShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { tText } = useTranslation();
  const isPremiumUser = (user?.premiumTier === 'basic' || user?.premiumTier === 'pro' || user?.premiumTier === 'elite');

  const shortcuts: Shortcut[] = [
    {
      id: "email",
      icon: <Mail className="h-5 w-5" />,
      label: tText("Email Support"),
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => window.open("mailto:subhajiteditz90@gmail.com?subject=FileNova Support Request&body=Hi, I need help with..."),
      tooltip: tText("Email Support (All Users)"),
      availableFor: "all",
    },
    ...(isPremiumUser ? [{
      id: "whatsapp",
      icon: <MessageCircle className="h-5 w-5 fill-current" />,
      label: tText("WhatsApp Support"),
      color: "bg-emerald-500 hover:bg-emerald-600",
      action: () => window.open("https://wa.me/919064560741?text=Hi! I am a FileNova Premium user and need assistance with..."),
      tooltip: tText("WhatsApp Support (Premium Only)"),
      availableFor: "premium" as const,
    }] : []),
    ...(isPremiumUser ? [{
      id: "phone",
      icon: <Phone className="h-5 w-5" />,
      label: tText("Call Us"),
      color: "bg-red-500 hover:bg-red-600",
      action: () => window.open("tel:+919064560741"),
      tooltip: tText("Call Support (Premium Only)"),
      availableFor: "premium" as const,
    }] : []),
    {
      id: "document",
      icon: <HelpCircle className="h-5 w-5" />,
      label: tText("Help Docs"),
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => window.open("/resources", "_self"),
      tooltip: tText("View Documentation"),
      availableFor: "all" as const,
    },
    {
      id: "ai",
      icon: <Bot className="h-5 w-5" />,
      label: tText("AI Assistant"),
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => {
        const event = new CustomEvent("openAIAssistant");
        window.dispatchEvent(event);
        setIsOpen(false);
      },
      tooltip: tText("Ask AI Assistant"),
      availableFor: "all" as const,
    },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[110] flex flex-col items-center">
      {/* Shortcut Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
              hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
            }}
            className="flex flex-col gap-3.5 mb-4 items-center"
          >
            {shortcuts.map((shortcut) => (
              <motion.div
                key={shortcut.id}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.6 },
                  visible: { opacity: 1, y: 0, scale: 1 }
                }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="relative group"
              >
                <button
                  onClick={shortcut.action}
                  aria-label={shortcut.tooltip}
                  title={shortcut.tooltip}
                  className={`${shortcut.color} w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer`}
                >
                  {shortcut.icon}
                </button>
                
                {/* Tooltip */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl">
                  {shortcut.tooltip}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-900 border-l border-b border-slate-850 rotate-45"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle contact menu"
        title="Toggle contact menu"
        className="w-14 h-14 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white relative cursor-pointer z-20 border border-white/10"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </motion.div>
        
        {/* Pulse Aura */}
        {!isOpen && (
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.35, 0, 0.35],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-indigo-500 pointer-events-none z-[-1]"
          />
        )}

        {isPremiumUser && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] z-10">⭐</span>
        )}
      </motion.button>
    </div>
  );
}
