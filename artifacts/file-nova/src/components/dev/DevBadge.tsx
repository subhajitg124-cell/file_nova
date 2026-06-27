import React from "react";
import { useLocation } from "wouter";
import { Code } from "lucide-react";

export function DevBadge() {
  const [, setLocation] = useLocation();

  return (
    <button
      onClick={() => setLocation("/dev")}
      title="Internal Developer Account"
      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 px-3 py-1.5 text-[10px] font-black text-indigo-400 border border-indigo-500/30 hover:from-indigo-500/30 hover:via-purple-500/30 hover:to-pink-500/30 hover:border-indigo-400/50 transition-all duration-300 cursor-pointer animate-pulse-glow shrink-0"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
      </span>
      <Code className="h-3 w-3" />
      <span>Developer</span>
    </button>
  );
}
