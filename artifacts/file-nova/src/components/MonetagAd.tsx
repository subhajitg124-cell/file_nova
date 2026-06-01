import React from "react";
import { useSubscription } from "@/hooks/useSubscription";

interface MonetagAdProps {
  placement: "top" | "bottom" | "sidebar";
  className?: string;
}

export function MonetagAd({ placement, className = "" }: MonetagAdProps) {
  const { premiumTier, premiumEnabled } = useSubscription();

  // Show ads ONLY for free/guest users. Hide completely for basic, pro, elite, and any premium accounts.
  if (premiumEnabled || premiumTier === "basic" || premiumTier === "pro" || premiumTier === "elite") {
    return null;
  }

  // Determine size classes based on placement
  let sizeClasses = "";
  let label = "";
  let activeZone = "11084620"; // Default In-Page Push

  if (placement === "top") {
    sizeClasses = "w-full max-w-7xl mx-auto h-[90px] md:h-[100px] mb-6";
    label = "Sponsor Advertisement (Leaderboard 728x90)";
    activeZone = "11084620";
  } else if (placement === "bottom") {
    sizeClasses = "w-full max-w-7xl mx-auto h-[90px] md:h-[100px] mt-8";
    label = "Sponsor Advertisement (Leaderboard 728x90)";
    activeZone = "11084620";
  } else if (placement === "sidebar") {
    // Sidebar: 300x250, hidden on mobile, visible on medium screens and up
    sizeClasses = "hidden lg:flex w-[300px] h-[250px] shrink-0 sticky top-24 self-start ml-6";
    label = "Sponsor Ad (Medium Rectangle 300x250)";
    activeZone = "11084620"; // Or other display banners
  }

  return (
    <>
      {/* Monetag Multitag Integration Zones */}
      <div 
        className="hidden" 
        data-zone-onclick="11084619" 
        data-zone-inpage="11084620" 
        data-zone-vignette="11084621" 
        data-zone-push="11084622" 
      />
      <script 
        type="text/javascript"
        dangerouslySetInnerHTML={{ 
          __html: `
            /* Monetag Multitag Integration */
            // OnClick Popunder: 11084619
            // In-Page Push: 11084620
            // Vignette Banner: 11084621
            // Push Notifications: 11084622
          ` 
        }} 
      />

      {/* Visual Ad Unit Container */}
      <div 
        className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-sky-500/30 bg-sky-500/5 backdrop-blur-[1px] p-2 transition-all duration-300 hover:border-sky-500/50 hover:bg-sky-500/10 ${sizeClasses} ${className}`}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-500/60 mb-1">
          Advertisement
        </span>
        <div className="flex items-center justify-center w-full h-full bg-background/40 rounded-xl border border-border/40 text-[11px] font-medium text-muted-foreground/80 text-center px-4">
          <div>
            <p className="font-bold text-sky-600 dark:text-sky-400">{label}</p>
            <p className="text-[9px] text-muted-foreground/60 mt-0.5">Monetag Ad Network (Zone ID: {activeZone})</p>
          </div>
        </div>
      </div>
    </>
  );
}
