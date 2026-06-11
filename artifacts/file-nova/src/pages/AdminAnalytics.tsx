import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  BarChart3, TrendingUp, AlertTriangle, Search, Shuffle, Users, 
  RefreshCw, ChevronRight, Activity, CheckCircle2
} from "lucide-react";
import { analytics } from "@/lib/analytics";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdmin } from "@/lib/admin";

export default function AdminAnalytics() {
  const admin = useAdmin();
  const [, setLocation] = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(analytics.getStats());

  useEffect(() => {
    if (!admin.isAuthenticated) {
      setLocation("/nova-login");
    }
  }, [admin.isAuthenticated, setLocation]);

  useEffect(() => {
    setStats(analytics.getStats());
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setStats(analytics.getStats());
      setRefreshing(false);
    }, 650);
  };

  if (!admin.isAuthenticated) return null;

  return (
    <AdminLayout title="Diagnostics & Analytics">
      <div className="space-y-6 animate-fade-in">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Console Diagnostics</h2>
            <p className="text-xs text-slate-400 mt-0.5">Audit matched tools, autocomplete queries, and client-side conversions</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Sessions", val: stats.totalSessions.toLocaleString(), change: "+12.4%", icon: <Users className="h-5 w-5 text-indigo-400" /> },
            { label: "Successful Runs", val: `${stats.successRate}%`, change: "+0.04%", icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" /> },
            { label: "Processing Latency", val: stats.latency, change: "-120ms", icon: <Activity className="h-5 w-5 text-sky-400" /> },
            { label: "Search Conversions", val: stats.searchConversions, change: "+4.1%", icon: <Search className="h-5 w-5 text-purple-400" /> },
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-white/[0.06] rounded-2xl p-5 flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
                <div className="text-2xl font-black text-white mt-1 tracking-tight font-heading">{stat.val}</div>
                <span className="text-[9.5px] font-bold text-emerald-400">{stat.change} vs yesterday</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-white/[0.05]">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Double Column Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Column 1: Live execution statistics */}
          <div className="bg-slate-900/40 border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Tool Execution Diagnostics (Live)
            </h3>
            
            <div className="space-y-3.5">
              {stats.tools.map((tool, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>{tool.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{tool.count} calls ({tool.failure} failures)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/[0.04]">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                      style={{ width: `${tool.pct}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Autocomplete Drop-off Logs */}
          <div className="bg-slate-900/40 border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Search Queries & Drop-offs
            </h3>

            <div className="divide-y divide-white/[0.05] max-h-64 overflow-y-auto pr-1">
              {stats.queries.map((log, idx) => (
                <div key={idx} className="py-3.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200 font-mono">&quot;{log.query}&quot;</span>
                    <div className="text-[10px] text-slate-450 mt-0.5">Matched: {log.match}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-lg border ${
                      log.status === "Redirected" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {log.status}
                    </span>
                    <div className="text-[9px] text-slate-500 mt-1.5">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Workflow Funnels */}
        <div className="bg-slate-900/40 border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Shuffle className="h-4 w-4" />
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
                <div key={idx} className="p-4.5 rounded-xl bg-slate-950 border border-white/[0.05] space-y-3">
                  <div className="text-xs font-bold text-white">{funnel.title}</div>
                  <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-slate-400 flex-wrap">
                    {funnel.chain.map((c, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />}
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/[0.06] text-slate-300">{c}</span>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-white/[0.05]">
                    <span>{runCount} runs</span>
                    <span className="text-emerald-400 font-bold">{funnel.conv} conversion</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
