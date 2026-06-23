import React from "react";
import { Megaphone, Sparkles } from "lucide-react";

export function NewsTicker() {
  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          15% { transform: rotate(-15deg) scale(1.1); }
          30% { transform: rotate(12deg) scale(1.1); }
          45% { transform: rotate(-10deg) scale(1.1); }
          60% { transform: rotate(8deg) scale(1.1); }
          75% { transform: rotate(-4deg) scale(1); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .animate-shake {
          animation: shake 1.8s ease-in-out infinite;
        }
      `}</style>
      <div className="w-full bg-[var(--fn-surface-elevated)] border-y border-[var(--fn-border)] text-[var(--fn-text-primary)] h-10 flex items-center overflow-hidden font-sans relative z-30 select-none">
        {/* Animated Left Warning Badge */}
        <div className="h-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-4 flex items-center gap-2 shrink-0 font-black text-xs tracking-wider uppercase text-white shadow-[4px_0_15px_rgba(220,38,38,0.4)] relative z-10 border-r border-white/10">
          <Megaphone className="h-4 w-4 animate-shake text-white" />
          <span className="bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">Latest Update</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </div>
        
        {/* Scrolling Headline */}
        <div className="flex-1 overflow-hidden relative flex items-center h-full bg-[var(--fn-surface-elevated)]">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--fn-surface-elevated)] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--fn-surface-elevated)] to-transparent z-10 pointer-events-none" />
          
          <div className="animate-marquee whitespace-nowrap text-xs font-bold text-[var(--fn-text-primary)] tracking-wide flex items-center gap-6 cursor-pointer">
            <span className="flex items-center gap-3.5">
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)]">অন্নপূর্ণা ভান্ডার</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)]">PM-Kisan Samman Nidhi</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)]">Panchayat Recruitment</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)]">West Bengal Yuva Shakti Yojana</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)] text-[10px]">Govt Schemes India</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)]">College Admission</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-secondary)] italic">more events are applied using the help of our website.</span>
            </span>

            <span className="text-indigo-400 font-black"><Sparkles className="h-3.5 w-3.5 inline animate-spin" /></span>

            <span className="flex items-center gap-3.5">
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)]">অন্নপূর্ণা ভান্ডার</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)]">PM-Kisan Samman Nidhi</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)]">Panchayat Recruitment</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)]">West Bengal Yuva Shakti Yojana</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)] text-[10px]">Govt Schemes India</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-primary)] font-extrabold bg-[var(--fn-surface)] px-2 py-0.5 rounded border border-[var(--fn-border)]">College Admission</span>
              <span className="text-[var(--fn-text-secondary)] font-bold">•</span>
              <span className="text-[var(--fn-text-secondary)] italic">more events are applied using the help of our website.</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
