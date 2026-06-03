// artifacts/file-nova/src/components/OfflineBanner.tsx

import { useState, useEffect } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [canShowUpdate, setCanShowUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const tenMinutes = 10 * 60 * 1000;
    const timer = window.setTimeout(() => {
      const today = new Date().toDateString();
      const lastPrompt = localStorage.getItem("lastUpdatePrompt");
      if (lastPrompt !== today) {
        setCanShowUpdate(true);
        localStorage.setItem("lastUpdatePrompt", today);
      }
    }, tenMinutes);

    return () => window.clearTimeout(timer);
  }, []);

  // Detect service worker update
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          newWorker?.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }
  }, []);

  // Show "back online" toast when reconnected
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowOnlineToast(true);
      const t = setTimeout(() => {
        setShowOnlineToast(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isOnline, wasOffline]);

  const reloadForUpdate = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Offline warning bar */}
      {!isOnline && (
        <div className="offline-bar">
          <span className="offline-bar__icon">📡</span>
          <div className="offline-bar__body">
            <span className="offline-bar__title">You're offline</span>
            <span className="offline-bar__subtitle">
              The app is still usable — file uploads will resume when reconnected.
            </span>
          </div>
          <div className="offline-bar__badge">OFFLINE MODE</div>
        </div>
      )}

      {/* Back online toast */}
      {showOnlineToast && (
        <div className="online-toast animate-slide-right">
          <span className="online-toast__icon">✅</span>
          <span className="online-toast__text">Back online</span>
        </div>
      )}

      {/* Update available banner */}
      {canShowUpdate && updateAvailable && (
        <div className="update-banner">
          <span className="update-banner__icon">🚀</span>
          <div className="update-banner__body">
            <div className="update-banner__title">Update available</div>
            <div className="update-banner__subtitle">
              Reload to get the latest FileNova
            </div>
          </div>
          <button
            onClick={reloadForUpdate}
            className="update-banner__btn"
          >
            Reload
          </button>
        </div>
      )}
    </>
  );
}
