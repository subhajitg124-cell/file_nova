import React, { useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";

interface AdSenseUnitProps {
  className?: string;
}

export function AdSenseUnit({ className = "" }: AdSenseUnitProps) {
  const { premiumEnabled } = useSubscription();

  useEffect(() => {
    if (premiumEnabled) return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Catch silently as AdSense SDK might load asynchronously or be blocked
      console.debug("AdSense push execution:", e);
    }
  }, [premiumEnabled]);

  if (premiumEnabled) {
    return null;
  }

  return (
    <div className={`w-full overflow-hidden flex justify-center items-center my-4 bg-muted/15 rounded-2xl p-3 border border-dashed border-border/80 min-h-[100px] ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minWidth: "250px" }}
        data-ad-client="ca-pub-1022082801397971"
        data-ad-slot="4756418093"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
