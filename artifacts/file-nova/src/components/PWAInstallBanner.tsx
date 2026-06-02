import React from "react";
import { X, Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export function PWAInstallBanner() {
  const { canInstall, isMobile, isInstalled, isDismissed, install, dismiss } = usePWAInstall();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (canInstall && isMobile && !isInstalled && !isDismissed) {
      setVisible(true);
    }
  }, [canInstall, isMobile, isInstalled, isDismissed]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md bg-card border-t border-border rounded-t-3xl p-4 shadow-premium-lg animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
          <Download className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Add FileNova to Home Screen</p>
          <p className="text-xs text-muted-foreground">Faster access and offline support</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const success = await install();
              if (success) setVisible(false);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition"
          >
            Install
          </button>
          <button
            onClick={() => {
              dismiss();
              setVisible(false);
            }}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallBanner;