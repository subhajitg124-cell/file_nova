import { useFileStore } from "@/store/useFileStore";
const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (err: Error | null, token: string | null = null) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

export function setupFetchInterceptor(
  setLimitModalOpen: (open: boolean) => void,
  setModalLimit: (limit: number) => void,
  setModalUsage: (usage: number) => void,
  getAuthState: () => { user: any; token: string | null },
  logoutUser: () => Promise<void>,
  setAuthToken: (token: string | null) => void
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

    // Attach Bearer token to API requests
    if (url && (url.includes("/api/") || url.startsWith("/api/"))) {
      const authState = getAuthState();
      const token = authState.token || localStorage.getItem("filenova_token");
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

    // Simulation/Offline modes
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

    // Add bonus limits header if present
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

    const makeRequest = async (currentInit: RequestInit) => {
      return originalFetch(input, currentInit);
    };

    let response = await makeRequest(newInit);

    // If 401 Unauthorized, attempt refresh
    if (response.status === 401) {
      const urlStr = typeof input === "string" ? input : (input instanceof URL ? input.toString() : (input && (input as Request).url ? (input as Request).url : ""));
      const isAuthMe = urlStr.includes("/api/v1/auth/me");
      const isRefresh = urlStr.includes("/api/v1/auth/refresh");
      const isHealth = urlStr.includes("/api/health");

      if (!isAuthMe && !isRefresh && !isHealth) {
        const authState = getAuthState();
        const token = authState.token || localStorage.getItem("filenova_token");

        if (token && !token.startsWith("local_")) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              refreshQueue.push((newToken) => {
                if (newToken) {
                  // Update authorization header in the retried request
                  const retriedInit = { ...newInit };
                  if (retriedInit.headers instanceof Headers) {
                    retriedInit.headers.set("Authorization", `Bearer ${newToken}`);
                  } else if (Array.isArray(retriedInit.headers)) {
                    retriedInit.headers = retriedInit.headers.map(([k, v]) => 
                      k.toLowerCase() === "authorization" ? ["Authorization", `Bearer ${newToken}`] : [k, v]
                    );
                  } else {
                    retriedInit.headers = {
                      ...(retriedInit.headers as Record<string, string>),
                      "Authorization": `Bearer ${newToken}`
                    };
                  }
                  resolve(makeRequest(retriedInit));
                } else {
                  reject(new Error("Session expired"));
                }
              });
            });
          }

          isRefreshing = true;

          try {
            console.log("%c[AUTH] Token expired. Attempting refresh...", "color:orange;font-weight:bold");
            
            const refreshRes = await originalFetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              credentials: "include"
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData && refreshData.success && refreshData.token) {
                const newToken = refreshData.token;
                localStorage.setItem("filenova_token", newToken);
                setAuthToken(newToken);

                console.log("%c[AUTH] Token refreshed successfully.", "color:green;font-weight:bold");

                // Update original request headers with new token
                if (newInit.headers instanceof Headers) {
                  newInit.headers.set("Authorization", `Bearer ${newToken}`);
                } else if (Array.isArray(newInit.headers)) {
                  newInit.headers = newInit.headers.map(([k, v]) => 
                    k.toLowerCase() === "authorization" ? ["Authorization", `Bearer ${newToken}`] : [k, v]
                  );
                } else {
                  newInit.headers = {
                    ...(newInit.headers as Record<string, string>),
                    "Authorization": `Bearer ${newToken}`
                  };
                }

                // Process queued requests with the new token
                processQueue(null, newToken);
                isRefreshing = false;

                // Retry original request
                return await makeRequest(newInit);
              }
            }

            // If refresh response is not OK, fail refresh
            throw new Error("Refresh token invalid or expired");
          } catch (err) {
            console.error("[AUTH] Session refresh failed. Logging out...", err);
            localStorage.removeItem("filenova_token");
            setAuthToken(null);
            processQueue(new Error("Refresh failed"), null);
            isRefreshing = false;
            await logoutUser();
            return response; // Return original 401 response
          }
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
