import { Router } from "express";
import { emailService } from "../services/emailService";

const router = Router();

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "subhajiteditz90@gmail.com";

const CONTACT_HTML = (name: string, email: string, subject: string, message: string, plan?: string, ip?: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>New Contact Form Submission</title></head>
<body style="font-family: 'Inter', sans-serif; background: #0f0f1a; color: #f8fafc; padding: 32px;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 24px; font-weight: 700; color: #818CF8;">FileNova</span>
      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">New Contact Form Submission</p>
    </div>
    <div style="background: #1e1b4b; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
      <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #818cf8;">${email}</a></p>
      ${plan ? `<p style="margin: 8px 0;"><strong>Plan:</strong> ${plan}</p>` : ''}
      ${ip ? `<p style="margin: 8px 0;"><strong>IP:</strong> ${ip}</p>` : ''}
    </div>
    <div style="background: #0f172a; padding: 20px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 16px;">
      <p style="margin: 0 0 8px; color: #818cf8; font-weight: 700;">Subject: ${subject}</p>
      <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
    </div>
    <p style="color: #475569; font-size: 12px; margin-top: 24px;">
      Reply directly to this email to respond to the user. The user's email is: ${email}
    </p>
  </div>
</body>
</html>
`;

router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim()) return res.status(400).json({ error: "Name is required" });
    if (!email?.trim()) return res.status(400).json({ error: "Email is required" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Invalid email address" });
    if (!subject?.trim()) return res.status(400).json({ error: "Subject is required" });
    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });
    if (message.length > 2000) return res.status(400).json({ error: "Message too long (max 2000 characters)" });

    const ip = req.ip || req.headers["x-forwarded-for"] || "";
    const plan = req.body.plan || "unknown";

    const html = CONTACT_HTML(
      name.trim(),
      email.trim(),
      subject.trim(),
      message.trim(),
      plan,
      String(ip).substring(0, 45)
    );

    const sent = await emailService.sendContactEmail(CONTACT_EMAIL, html, subject.trim(), email.trim());

    if (!sent) {
      return res.status(500).json({ error: "Failed to send email. Please try again." });
    }

    return res.json({ success: true, message: "Your message has been sent! We'll get back to you within 24 hours." });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

export default router;
