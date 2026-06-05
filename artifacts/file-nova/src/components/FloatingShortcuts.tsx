import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, 
  MessageSquare, 
  HelpCircle, 
  Bot, 
  X, 
  MessageCircle, 
  Mail,
  BookOpen,
  FolderOpen,
  Gift
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/lib/i18n";

interface Shortcut {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  action: () => void;
  tooltip: string;
}

export function FloatingShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { tText } = useTranslation();
  const isPremiumUser = (user?.premiumTier === 'basic' || user?.premiumTier === 'pro' || user?.premiumTier === 'elite');

  const shortcuts: Shortcut[] = [
    {
      id: "ai",
      icon: <Bot className="h-5 w-5" />,
      label: tText("AI Assistant"),
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => {
        const event = new CustomEvent("openAIAssistant");
        window.dispatchEvent(event);
      },
      tooltip: tText("Ask AI Assistant"),
    },
    {
      id: "blog",
      icon: <BookOpen className="h-5 w-5" />,
      label: tText("Blogs"),
      color: "bg-amber-500 hover:bg-amber-600",
      action: () => window.open("/blog", "_self"),
      tooltip: tText("Read our Blogs"),
    },
    {
      id: "resources",
      icon: <FolderOpen className="h-5 w-5" />,
      label: tText("Resources"),
      color: "bg-teal-500 hover:bg-teal-600",
      action: () => window.open("/resources", "_self"),
      tooltip: tText("Browse Resources"),
    },
    {
      id: "help",
      icon: <HelpCircle className="h-5 w-5" />,
      label: tText("Help Center"),
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => window.open("/contact", "_self"),
      tooltip: tText("Contact Help Center"),
    },
    {
      id: "hostinger",
      icon: <Gift className="h-5 w-5" />,
      label: tText("Hostinger Deals"),
      color: "bg-indigo-600 hover:bg-indigo-700",
      action: () => window.open("https://www.hostinger.in/", "_blank"),
      tooltip: tText("Hostinger Deals & Promos"),
    },
    {
      id: "email",
      icon: <Mail className="h-5 w-5" />,
      label: tText("Email"),
      color: "bg-sky-500 hover:bg-sky-600",
      action: () => window.open("mailto:subhajiteditz90@gmail.com?subject=FileNova Support Request&body=Hi, I need help with..."),
      tooltip: tText("Email Support (All Users)"),
    },
    ...(isPremiumUser ? [
      {
        id: "whatsapp",
        icon: <MessageCircle className="h-5 w-5 fill-current" />,
        label: tText("WhatsApp"),
        color: "bg-emerald-500 hover:bg-emerald-600",
        action: () => window.open("https://wa.me/919064560741?text=Hi! I am a FileNova Premium user and need assistance with..."),
        tooltip: tText("WhatsApp Support (Premium Only)"),
      },
      {
        id: "phone",
        icon: <Phone className="h-5 w-5" />,
        label: tText("Call Support"),
        color: "bg-red-500 hover:bg-red-600",
        action: () => window.open("tel:+919064560741"),
        tooltip: tText("Call Support (Premium Only)"),
      }
    ] : [])
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[110]">
      {/* ── DESKTOP LAYOUT (Horizontal Glass Ice Dock) ── */}
      <motion.div
        layout
        initial={{ borderRadius: 28 }}
        animate={{ 
          borderRadius: 20,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="hidden md:flex items-center bg-slate-900/35 backdrop-blur-xl border border-white/10 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.37)] gap-2 select-none overflow-hidden"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-white/10 hover:border-white/20 flex items-center justify-center text-white cursor-pointer transition-all shadow-inner shrink-0"
          title={isOpen ? tText("Collapse menu") : tText("Expand shortcuts")}
          aria-label={isOpen ? tText("Collapse menu") : tText("Expand shortcuts")}
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
          </motion.div>
        </button>

        {/* Divider */}
        {isOpen && (
          <div className="h-6 w-px bg-white/10 shrink-0 animate-fade-in" />
        )}

        {/* Expanded Horizontal Icons */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2 pr-2 overflow-hidden whitespace-nowrap"
            >
              {shortcuts.map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={{ scale: 1.18, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group shrink-0"
                >
                  <button
                    onClick={s.action}
                    className={`w-10 h-10 rounded-xl ${s.color} text-white flex items-center justify-center shadow-lg transition-all cursor-pointer`}
                    title={s.tooltip}
                    aria-label={s.tooltip}
                  >
                    {s.icon}
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-white/10 text-white px-2.5 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-[120]">
                    {s.tooltip}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-white/10 rotate-45"></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── MOBILE LAYOUT (Floating Ice Capsule with Overlay Panel) ── */}
      <div className="md:hidden flex flex-col items-center">
        {/* Menu Toggle FAB */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-13 h-13 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white relative cursor-pointer border border-white/15 z-[106]"
          aria-label={tText("Toggle shortcut menu")}
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
          </motion.div>
          
          {!isOpen && (
            <motion.div
              animate={{
                scale: [1, 1.35, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-indigo-500 pointer-events-none z-[-1]"
            />
          )}
        </motion.button>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[104]"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="fixed left-4 right-4 bottom-24 z-[105] backdrop-blur-2xl bg-slate-950/80 border border-white/10 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div>
                    <h3 className="text-xs font-black text-white/90 tracking-wide uppercase">{tText("Quick Navigation")}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tText("Access features instantly")}</p>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    title={tText("Close menu")}
                    aria-label={tText("Close menu")}
                    className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2.5">
                  {shortcuts.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { s.action(); setIsOpen(false); }}
                      className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 active:scale-95 transition-all text-center group cursor-pointer"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg ${s.color}`}>
                        {s.icon}
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 group-hover:text-white leading-tight truncate w-full">{s.label}</span>
                    </button>
                  ))}
                </div>

                {isPremiumUser && (
                  <div className="text-[10px] font-bold text-yellow-400 bg-yellow-400/5 border border-yellow-400/10 rounded-xl py-2 px-3 flex items-center gap-1.5 justify-center">
                    <span>⭐</span> {tText("Premium Support Features Active")}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
