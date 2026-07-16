import React, { useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Sparkles, CheckCircle2, ShieldCheck, Copy, 
  Check, X, ChevronRight, MessageCircle, Coffee, Server, Gift
} from "lucide-react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { FILENOVA_UPI_ID, createUpiQrUrl } from "@/lib/upi";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  defaultBorder?: string;
  isActive?: boolean;
}

function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(244, 63, 94, 0.12)", // Rose spotlight
  borderColor = "var(--fn-border-strong)",
  defaultBorder = "var(--fn-border)",
  isActive = false,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    const w = rect.width;
    const h = rect.height;
    const dx = x - w / 2;
    const dy = y - h / 2;
    const maxTilt = 5;
    setTilt({
      x: -(dy / (h / 2)) * maxTilt,
      y: (dx / (w / 2)) * maxTilt,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 backdrop-blur-md perspective-1000 preserve-3d ${
        isActive ? "ring-2 ring-rose-500/50" : ""
      } ${className}`}
      style={{
        borderColor: isHovered ? borderColor : defaultBorder,
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
          : isActive
            ? `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1.025, 1.025, 1.025)`
            : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  );
}

export default function PricingPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrAmount, setQrAmount] = useState<number>(10);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(FILENOVA_UPI_ID);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerDonation = (amount: number) => {
    if (amount <= 0 || isNaN(amount)) {
      toast.error("Please select or enter a valid amount.");
      return;
    }
    setQrAmount(amount);
    setIsQrOpen(true);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(customAmount);
    triggerDonation(amt);
  };

  const preSets = [
    {
      amount: 10,
      title: "Cutting Chai",
      description: "Buy us a cutting chai! Keeps our coding fuel filled.",
      icon: Coffee,
      color: "from-amber-500/20 to-orange-500/10 border-orange-500/20 text-orange-500",
      btnText: "Donate ₹10",
      accent: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    },
    {
      amount: 50,
      title: "Filter Coffee",
      description: "Buy us a filter coffee! Feeds our developer caffeine needs.",
      icon: Gift,
      color: "from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-500",
      btnText: "Donate ₹50",
      accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      popular: true
    },
    {
      amount: 100,
      title: "Fuel the Servers",
      description: "Directly funds our CPU/storage hardware costs for a month.",
      icon: Server,
      color: "from-indigo-500/20 to-violet-500/10 border-indigo-500/20 text-indigo-500",
      btnText: "Donate ₹100",
      accent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--fn-background)] text-[var(--fn-text-primary)] flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col relative overflow-hidden py-16 md:py-24">
        {/* Subtle grid patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10 flex-1 flex flex-col justify-center">
          
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-6"
            >
              <Heart className="h-3.5 w-3.5 fill-rose-500" />
              100% Free & Open Source
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black font-sans leading-tight tracking-tight text-white mb-6"
            >
              Supported by the <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 bg-clip-text text-transparent">Community</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-[var(--fn-text-secondary)] font-medium leading-relaxed"
            >
              FileNova has removed all paid tiers. We are now completely free, unlimited, and ad-free for all students, cyber cafe operators, and creators. We rely entirely on voluntary contributions to keep the servers running.
            </motion.p>
          </div>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full mb-12">
            {preSets.map((preset, index) => {
              const Icon = preset.icon;
              return (
                <motion.div
                  key={preset.amount}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                >
                  <SpotlightCard 
                    isActive={preset.popular} 
                    className="h-full flex flex-col justify-between p-6 bg-[var(--fn-surface)] relative"
                  >
                    {preset.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md z-20">
                        Most Popular Support
                      </span>
                    )}

                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${preset.color} border shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-white">{preset.title}</h3>
                        <p className="text-2xl font-extrabold text-white mt-1">₹{preset.amount}</p>
                      </div>

                      <p className="text-xs text-[var(--fn-text-secondary)] font-semibold leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      onClick={() => triggerDonation(preset.amount)}
                      className={`w-full mt-6 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all duration-200 cursor-pointer ${
                        preset.popular
                          ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 text-white shadow-rose-500/20"
                          : "bg-[var(--fn-surface-elevated)] border border-[var(--fn-border)] hover:bg-[var(--fn-surface-hover)] text-white"
                      }`}
                    >
                      {preset.btnText}
                    </button>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>

          {/* Custom Support Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-4xl mx-auto w-full border border-[var(--fn-border)] bg-[var(--fn-surface)]/40 backdrop-blur-md rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-16"
          >
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400/20" />
                Want to support with a custom amount?
              </h3>
              <p className="text-xs text-[var(--fn-text-secondary)] font-semibold leading-relaxed">
                Enter any amount to contribute. Every rupee goes directly to API usage fees and domain costs.
              </p>
            </div>

            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <div className="relative flex-1 md:flex-none">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[var(--fn-text-secondary)]">₹</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full md:w-44 bg-[var(--fn-surface-elevated)] border border-[var(--fn-border)] rounded-xl pl-8 pr-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  min="1"
                />
              </div>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-black text-xs font-black shadow-md cursor-pointer transition shrink-0"
              >
                Donate
              </button>
            </form>
          </motion.div>

          {/* Quick Info & Copy UPI block */}
          <div className="max-w-xl mx-auto w-full text-center space-y-6">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded">Fee-Free UPI Transfer</span>
              <p className="text-xs text-[var(--fn-text-secondary)] font-semibold leading-relaxed">
                Skip standard payment processing fees by sending directly using our UPI ID:
              </p>
              <div className="flex items-center gap-2 bg-[var(--fn-surface-elevated)] border border-[var(--fn-border)] rounded-xl px-4 py-2 mt-2 w-full max-w-sm justify-between">
                <code className="text-xs font-extrabold text-white font-mono">{FILENOVA_UPI_ID}</code>
                <button
                  onClick={handleCopyUpi}
                  className="p-1 text-[var(--fn-text-secondary)] hover:text-white transition rounded-md hover:bg-white/5 cursor-pointer"
                  title="Copy UPI ID"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* QR MODAL DIALOG */}
      <AnimatePresence>
        {isQrOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-3xl shadow-premium max-w-sm w-full p-6 text-center relative flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsQrOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/25 rounded-full p-1.5 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <Heart className="h-8 w-8 text-rose-500 fill-rose-500/10 mb-2 animate-pulse" />
              <h3 className="text-base font-black text-white">Support FileNova</h3>
              <p className="text-xs text-[var(--fn-text-secondary)] mt-1 font-bold">Scan to pay ₹{qrAmount} with any UPI app</p>

              {/* QR Code Container */}
              <div className="my-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
                <img
                  src={createUpiQrUrl(qrAmount, `Support FileNova - Rs ${qrAmount}`)}
                  alt="UPI QR Code"
                  className="w-48 h-48 select-none"
                  width="192"
                  height="192"
                />
              </div>

              {/* Payee Info */}
              <div className="space-y-1 w-full text-left bg-muted/40 border border-border/80 rounded-2xl p-4 mb-4">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">UPI ID:</span>
                  <span className="text-white font-mono">{FILENOVA_UPI_ID}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="text-white">Subhajit Ghosh</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="text-rose-500 font-extrabold">₹{qrAmount}</span>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground font-semibold mb-2">
                Thank you so much! After scanning and completing the transfer, you may safely close this window.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
