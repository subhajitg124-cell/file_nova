import { useFileStore } from "@/store/useFileStore";
const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";

export function setupFetchInterceptor(
  setLimitModalOpen: (open: boolean) => void,
  setModalLimit: (limit: number) => void,
  setModalUsage: (usage: number) => void
) {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const [input, init] = args;
    let newInit = init ? { ...init } : {};

    const url = typeof input === "string"
      ? input
      : (input instanceof URL
        ? input.toString()
        : (input && (input as Request).url ? (input as Request).url : ""));

    if (url && (url.includes("/api/") || url.startsWith("/api/"))) {
      const token = localStorage.getItem("filenova_token");
      if (token && !token.startsWith("local_")) {
        if (!newInit.headers) {
          newInit.headers = { "Authorization": `Bearer ${token}` };
        } else if (newInit.headers instanceof Headers) {
          if (!newInit.headers.has("Authorization")) {
            newInit.headers.set("Authorization", `Bearer ${token}`);
          }
        } else if (Array.isArray(newInit.headers)) {
          const hasAuth = newInit.headers.some(([k]) => k.toLowerCase() === "authorization");
          if (!hasAuth) {
            newInit.headers.push(["Authorization", `Bearer ${token}`]);
          }
        } else {
          const headers = { ...newInit.headers } as Record<string, string>;
          const hasAuth = Object.keys(headers).some(k => k.toLowerCase() === "authorization");
          if (!hasAuth) {
            headers["Authorization"] = `Bearer ${token}`;
            newInit.headers = headers;
          }
        }
      }
    }

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
      const urlStr = typeof input === "string" ? input : (input instanceof URL ? input.toString() : (input && (input as Request).url ? (input as Request).url : ""));
      if (!urlStr.includes("/api/v1/auth/me") && !urlStr.includes("/api/health")) {
        try {
          const { useAuthStore } = await import("@/store/useAuthStore");
          const { user } = useAuthStore.getState();
          if (user) {
            console.log("%c[AUTH] 401 interceptor triggered. Verifying session integrity...", "color:orange;font-weight:bold", {
              url: urlStr,
              timestamp: new Date().toISOString(),
            });

            const token = localStorage.getItem("filenova_token");
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token && !token.startsWith("local_")) {
              headers["Authorization"] = `Bearer ${token}`;
            }

            const checkRes = await originalFetch(`${BACKEND_URL}/api/v1/auth/me`, {
              method: "GET",
              headers,
              credentials: "include",
            });

            if (checkRes.status === 200) {
              const data = await checkRes.json().catch(() => null);
              if (data && data.success && data.user === null) {
                console.warn("%c[AUTH] Session verification returned user:null — NOT logging out (may be transient). Preserving session from localStorage.", "color:red;font-weight:bold");
              } else {
                console.log("%c[AUTH] Session verification check passed or returned valid data. Retaining session.", "color:green;font-weight:bold");
              }
            } else {
              console.log(`%c[AUTH] Session verification endpoint returned status ${checkRes.status}. Retaining session as transient failure.`, "color:yellow;font-weight:bold");
            }
          }
        } catch (err) {
          console.error("[AUTH] Session verification error: ", err);
        }
      }
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
