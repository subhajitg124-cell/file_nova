import { useFileStore } from "@/store/useFileStore";

export function setupFetchInterceptor(
  setLimitModalOpen: (open: boolean) => void,
  setModalLimit: (limit: number) => void,
  setModalUsage: (usage: number) => void
) {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const [input, init] = args;
    let newInit = init ? { ...init } : {};

    // Sanitize headers: remove local_ mock tokens to ensure backend cookie authentication works
    if (newInit.headers) {
      if (newInit.headers instanceof Headers) {
        const auth = newInit.headers.get("Authorization");
        if (auth && auth.includes("local_")) {
          newInit.headers.delete("Authorization");
        }
      } else if (Array.isArray(newInit.headers)) {
        newInit.headers = newInit.headers.filter(([k, v]) => {
          return !(k.toLowerCase() === "authorization" && v.includes("local_"));
        });
      } else {
        const headers = { ...newInit.headers } as Record<string, string>;
        for (const k of Object.keys(headers)) {
          if (k.toLowerCase() === "authorization" && headers[k].includes("local_")) {
            delete headers[k];
          }
        }
        newInit.headers = headers;
      }
    }

    const url = typeof input === "string"
      ? input
      : (input instanceof URL
        ? input.toString()
        : (input && (input as Request).url ? (input as Request).url : ""));

    if (url && (url.includes("/api/") || url.startsWith("/api/"))) {
      const latencyStr = localStorage.getItem("filenova_simulated_latency");
      const latencyMs = latencyStr ? parseInt(latencyStr, 10) : 0;
      if (latencyMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, latencyMs));
      }
      if (localStorage.getItem("filenova_simulate_backend_offline") === "true") {
        throw new TypeError("Failed to fetch");
      }
    }

    if (url && (url.includes("/api/") || url.startsWith("/api/"))) {
      try {
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const hasYt = localStorage.getItem("fn_youtube_subscribed_at") === today;
        const hasInsta = localStorage.getItem("fn_instagram_followed_at") === today;
        const hasFb = localStorage.getItem("fn_facebook_followed_at") === today;

        let activeCount = 0;
        if (hasYt) activeCount++;
        if (hasInsta) activeCount++;
        if (hasFb) activeCount++;

        let bonusLimit = "";
        if (activeCount === 1) bonusLimit = "6";
        else if (activeCount === 2) bonusLimit = "8";
        else if (activeCount >= 3) bonusLimit = "12";

        if (bonusLimit) {
          if (newInit.headers instanceof Headers) {
            newInit.headers.set("x-filenova-bonus-limit", bonusLimit);
          } else if (Array.isArray(newInit.headers)) {
            newInit.headers.push(["x-filenova-bonus-limit", bonusLimit]);
          } else {
            const headers = { ...newInit.headers } as Record<string, string>;
            headers["x-filenova-bonus-limit"] = bonusLimit;
            newInit.headers = headers;
          }
        }
      } catch (_) {}
    }

    const response = await originalFetch(input, newInit);
    if (response.status === 401) {
      try {
        const { useAuthStore } = await import("@/store/useAuthStore");
        const { user, logout } = useAuthStore.getState();
        if (user) {
          logout();
        }
      } catch (_) {}
    }
    if (response.status === 403) {
      const clone = response.clone();
      try {
        const data = await clone.json();
        if (data.error === "LIMIT_EXCEEDED" || data.limitReached) {
          setModalLimit(data.limit ?? 3);
          setModalUsage(data.limit ?? 3);
          setLimitModalOpen(true);
        }
      } catch (_) {}
    }
    return response;
  };

  const handleLimitReached = (e: any) => {
    const data = e.detail;
    setModalLimit(data.limit ?? 3);
    setModalUsage(data.usage ?? 3);
    setLimitModalOpen(true);
  };

  window.addEventListener("filenova-limit-reached" as any, handleLimitReached);

  return () => {
    window.fetch = originalFetch;
    window.removeEventListener("filenova-limit-reached" as any, handleLimitReached);
  };
}
