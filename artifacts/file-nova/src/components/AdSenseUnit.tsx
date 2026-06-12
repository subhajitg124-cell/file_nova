import React, { useEffect, useRef } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdmin } from "@/lib/admin";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";

interface AdSenseUnitProps {
  type?: "display" | "multiplex";
  className?: string;
}

export function AdSenseUnit({ type = "display", className = "" }: AdSenseUnitProps) {
  const { premiumEnabled } = useSubscription();
  const { settings } = useAdmin();
  const altContainerRef = useRef<HTMLDivElement>(null);

  const adType = settings.adType || "internal";

  useEffect(() => {
    if (premiumEnabled || adType !== "adsense") return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Catch silently as AdSense SDK might load asynchronously or be blocked
      console.debug("AdSense push execution:", e);
    }
  }, [premiumEnabled, type, adType]);

  // Handle injection of alternative ad scripts
  useEffect(() => {
    if (premiumEnabled || adType !== "alternative" || !altContainerRef.current) return;

    const htmlCode = settings.alternativeAdCode || "";
    altContainerRef.current.innerHTML = "";

    if (!htmlCode.trim()) {
      return;
    }

    try {
      const range = document.createRange();
      const fragment = range.createContextualFragment(htmlCode);
      altContainerRef.current.appendChild(fragment);
    } catch (e) {
      console.error("Alternative ad script injection error:", e);
    }
  }, [premiumEnabled, adType, settings.alternativeAdCode]);

  if (premiumEnabled || adType === "none") {
    return null;
  }

  const isMultiplex = type === "multiplex";

  if (adType === "alternative") {
    return (
      <div 
        ref={altContainerRef} 
        className={`w-full overflow-hidden flex justify-center items-center my-4 min-h-[100px] ${className}`} 
      />
    );
  }

  if (adType === "internal") {
    // If a custom banner is provided, show it
    if (settings.customBannerImg) {
      return (
        <div className={`w-full overflow-hidden flex justify-center items-center my-4 rounded-2xl border border-border/80 ${className}`}>
          <a 
            href={settings.customBannerLink || "/pricing"} 
            target={settings.customBannerLink?.startsWith("http") ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className="w-full h-full block hover:opacity-95 transition-opacity"
          >
            <img 
              src={settings.customBannerImg} 
              alt="Sponsored Banner" 
              className="w-full h-auto object-cover max-h-[150px] rounded-2xl"
            />
          </a>
        </div>
      );
    }

    // Otherwise show the premium upsell card
    return (
      <div className={`w-full overflow-hidden my-4 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 rounded-2xl p-5 border border-indigo-500/20 shadow-md relative group hover:border-indigo-500/40 transition-all duration-300 ${className}`}>
        <div className="absolute top-2 right-2 flex gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase text-indigo-400 border border-indigo-500/20">
            <Zap className="h-2 w-2" /> Unlocked Speed
          </span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1 max-w-md text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" /> FileNova Premium
            </h4>
            <p className="text-xs font-bold text-white leading-relaxed">
              Remove all ads & get 100 daily actions from just ₹49/month
            </p>
            <p className="text-[10px] text-slate-400 leading-normal">
              Get direct voice assistance, high-speed compressions, and unlimited exam templates.
            </p>
          </div>
          <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/15 cursor-pointer transition-all duration-300 group-hover:translate-x-0.5 whitespace-nowrap">
            Upgrade Now <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  // Fallback to standard Google AdSense
  return (
    <div className={`w-full overflow-hidden flex justify-center items-center my-4 bg-muted/15 rounded-2xl p-3 border border-dashed border-border/80 min-h-[100px] ${className}`}>
      {isMultiplex ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-format="autorelaxed"
          data-ad-client="ca-pub-1022082801397971"
          data-ad-slot="6588374510"
        />
      ) : (
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minWidth: "250px" }}
          data-ad-client="ca-pub-1022082801397971"
          data-ad-slot="4756418093"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}
