import React from "react";
import { Megaphone } from "lucide-react";

export function NewsTicker() {
  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="w-full bg-slate-950 border-y border-indigo-500/20 text-white h-9 flex items-center overflow-hidden font-sans relative z-30 select-none">
        <div className="h-full bg-gradient-to-r from-red-600 to-amber-600 px-4 flex items-center gap-1.5 shrink-0 font-black text-[10px] tracking-wider uppercase text-white shadow-[4px_0_15px_rgba(220,38,38,0.35)] animate-pulse relative z-10">
          <Megaphone className="h-3.5 w-3.5" />
          <span>Latest Update</span>
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center h-full">
          <div className="animate-marquee whitespace-nowrap text-xs font-bold text-slate-200 tracking-wide flex items-center gap-4 cursor-pointer">
            <span>অন্নপূর্ণা ভান্ডার, PM-Kisan Samman Nidhi, Panchayat Recruitment, West Bengal Yuva Shakti Yojana | Govt Schemes India, College Admission, more events are applied using the help of our website.</span>
            <span className="text-indigo-400 font-extrabold">✦</span>
            <span>অন্নপূর্ণা ভান্ডার, PM-Kisan Samman Nidhi, Panchayat Recruitment, West Bengal Yuva Shakti Yojana | Govt Schemes India, College Admission, more events are applied using the help of our website.</span>
          </div>
        </div>
      </div>
    </>
  );
}
