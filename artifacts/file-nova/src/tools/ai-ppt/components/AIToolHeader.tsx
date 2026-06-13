import { Presentation, Sparkles } from "lucide-react";

export function AIToolHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl mb-6">
      {/* ambient glow dots */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl -ml-12 -mb-12" />

      <div className="relative flex flex-col md:flex-row items-center gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/15">
          <Presentation className="h-8 w-8 text-purple-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
              AI Slide Maker
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-200 border border-purple-400/20 backdrop-blur-md animate-pulse">
              <Sparkles className="h-3.5 w-3.5" /> Premium
            </span>
          </div>
          <p className="mt-2 text-indigo-200 text-sm max-w-xl">
            Topic to presentation in seconds — pick a theme, choose your tone, done.
          </p>
        </div>
      </div>
    </div>
  );
}
