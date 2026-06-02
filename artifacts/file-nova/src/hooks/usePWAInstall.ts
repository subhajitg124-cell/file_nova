import { useState, useEffect } from "react";

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setCanInstall(false);
      localStorage.setItem("filenova-pwa-dismissed", "installed");
      return true;
    }
    return false;
  };

  const isMobile = () => {
    if (typeof window === "undefined") return false;
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  };

  const isInstalled = () => {
    return window.matchMedia("(display-mode: standalone)").matches || 
           (window.navigator as any).standalone === true;
  };

  const isDismissed = () => {
    try {
      return localStorage.getItem("filenova-pwa-dismissed") === "true";
    } catch {
      return false;
    }
  };

  const dismiss = () => {
    localStorage.setItem("filenova-pwa-dismissed", "true");
    setCanInstall(false);
  };

  return {
    install,
    canInstall,
    isMobile: isMobile(),
    isInstalled: isInstalled(),
    isDismissed: isDismissed(),
    dismiss
  };
}

export default usePWAInstall;