import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  BarChart3, TrendingUp, AlertTriangle, Search, Shuffle, Users, 
  ArrowLeft, RefreshCw, ChevronRight, Activity 
} from "lucide-react";
import { analytics } from "@/lib/analytics";

export default function AdminAnalytics() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(analytics.getStats());

  useEffect(() => {
    setStats(analytics.getStats());
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setStats(analytics.getStats());
      setRefreshing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f8fafc] p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <Link href="/nova-control" className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white">FileNova Control Center</h1>
              <p className="text-xs text-slate-400 font-medium">Operational metrics & search drop-off analytics</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-950/40 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Diagnostics
          </button>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Sessions", val: stats.totalSessions.toLocaleString(), change: "+12.4%", icon: <Users className="h-5 w-5 text-indigo-400" /> },
            { label: "Successful Operations", val: `${stats.successRate}%`, change: "+0.04%", icon: <CheckCircleIcon className="h-5 w-5 text-emerald-400" /> },
            { label: "Processing Latency", val: stats.latency, change: "-120ms", icon: <TrendingUp className="h-5 w-5 text-sky-400" /> },
            { label: "Search Conversions", val: stats.searchConversions, change: "+4.1%", icon: <Search className="h-5 w-5 text-purple-400" /> },
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-4 flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{stat.label}</span>
                <div className="text-2xl font-black text-white">{stat.val}</div>
                <span className="text-[9px] font-bold text-emerald-400">{stat.change} vs yesterday</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/40 border border-white/[0.05]">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Double Column Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Most Used Tools & Failures */}
          <div className="bg-slate-900/30 border border-white/[0.08] rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Tool Execution Diagnostics (Live)
            </h3>
            
            <div className="space-y-3">
              {stats.tools.map((tool, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>{tool.name}</span>
                    <span className="font-mono text-slate-500">{tool.count} calls ({tool.failure} failures)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${tool.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Query Logs & Drop-off Analysis */}
          <div className="bg-slate-900/30 border border-white/[0.08] rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              Search Queries & Drop-offs
            </h3>

            <div className="divide-y divide-white/[0.05] max-h-64 overflow-y-auto">
              {stats.queries.map((log, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-300">&quot;{log.query}&quot;</span>
                    <div className="text-[10px] text-slate-500 font-medium">Matched: {log.match}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                      log.status === "Redirected" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {log.status}
                    </span>
                    <div className="text-[9px] text-slate-600 mt-0.5">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Workflow Pipeline Funnel */}
        <div className="bg-slate-900/30 border border-white/[0.08] rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
            <Shuffle className="h-4 w-4 text-sky-400" />
            Popular Multi-Step Workflow Funnels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Standard Submission", chain: ["Merge PDF", "Compress PDF", "Download"], count: 1202, conv: "92.4%" },
              { title: "Identity Validation", chain: ["Aadhaar Mask", "Protect PDF", "Download"], count: 852, conv: "85.1%" },
              { title: "Passport Setup", chain: ["Remove Background", "Resize Image", "Download"], count: 642, conv: "78.4%" },
            ].map((funnel, idx) => {
              const runCount = idx === 0 ? funnel.count + stats.funnelRunAddition : funnel.count;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.05] space-y-2">
                  <div className="text-xs font-black text-slate-200">{funnel.title}</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 flex-wrap">
                    {funnel.chain.map((c, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />}
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">{c}</span>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-white/[0.05]">
                    <span>{runCount} funnels run</span>
                    <span className="text-emerald-400 font-bold">{funnel.conv} completed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
