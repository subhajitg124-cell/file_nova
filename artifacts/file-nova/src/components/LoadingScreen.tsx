import React, { memo } from "react";
import { motion } from "framer-motion";

export const LoadingScreen: React.FC = memo(() => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans overflow-hidden relative">
      {/* Premium ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center z-10 flex flex-col items-center"
      >
        {/* Animated logo wrapper */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          {/* Circular outer rotating loading ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-white/10 border-t-purple-500 border-r-indigo-500 shadow-[0_0_25px_rgba(139,92,246,0.3)]"
          />

          {/* Pulse glowing ring */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-2 rounded-full bg-gradient-to-tr from-purple-500/15 to-indigo-500/15 blur-md"
          />

          {/* Glassmorphic Logo Container */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-indigo-950/50"
          >
            <img src="/logo.png" alt="FileNova - AI PDF & Image Tools" className="w-10 h-10 object-contain" width="40" height="40" fetchPriority="high" />
          </motion.div>
        </div>

        {/* Website Name with Text Gradient and Shimmer */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-400 mb-2"
        >
          FILENOVA AI
        </motion.h1>

        {/* Shimmer line indicator */}
        <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-12 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
          />
        </div>

        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Initializing Workspace</p>
        </motion.div>
      </motion.div>
    </div>
  );
});

export default LoadingScreen;
