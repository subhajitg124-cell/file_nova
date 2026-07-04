export async function verifyTurnstile(token: string, ip?: string): Promise<{ success: boolean; error?: string }> {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.warn("TURNSTILE_SECRET_KEY not configured — CAPTCHA verification disabled");
    return { success: false, error: "server-not-configured" };
  }

  const formData = new URLSearchParams();
  formData.append("secret", process.env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  if (ip) formData.append("remoteip", ip);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json();
    return {
      success: data.success === true,
      error: data["error-codes"]?.[0],
    };
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === "AbortError") {
      console.error("Turnstile verification timed out");
      return { success: false, error: "timeout" };
    }
    console.error("Turnstile verification error:", error.message);
    return { success: false, error: "network-error" };
  }
}
