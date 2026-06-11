import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@filenova.in";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const brandColor = "#6366f1";

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Welcome to FileNova!</title></head>
    <body style="font-family: 'Inter', sans-serif; background: #0f0f1a; color: #f8fafc; padding: 32px; border-radius: 16px;">
      <div style="max-width: 600px; margin: 0 auto; background: #111827; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
        <h1 style="color: #818cf8; font-size: 28px; margin-bottom: 16px;">Welcome to FileNova! 🚀</h1>
        <p style="font-size: 16px; margin-bottom: 16px;">Hi ${name},</p>
        <p style="margin-bottom: 16px;">Thanks for joining FileNova! You now have access to free PDF tools including:</p>
        <ul style="margin-bottom: 16px; padding-left: 20px;">
          <li>Merge & compress PDF files</li>
          <li>Resize photos and signatures</li>
          <li>Aadhaar masking (client-side)</li>
          <li>OCR text extraction</li>
        </ul>
        <a href="https://filenova.in" style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Start using FileNova</a>
        <p style="margin-top: 24px; font-size: 14px; color: #94a3b8;">
          Upgrade to Pro for unlimited daily operations and premium features.
          <a href="https://filenova.in/pricing" style="color: #818cf8;">View pricing</a>
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to FileNova! 🚀",
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}

export async function sendSubscriptionConfirmation(email: string, plan: string, expiry: Date): Promise<boolean> {
  const expiryDate = expiry.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>FileNova Pro Activated</title></head>
    <body style="font-family: 'Inter', sans-serif; background: #0f0f1a; color: #f8fafc; padding: 32px;">
      <div style="max-width: 600px; margin: 0 auto; background: #111827; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
        <h1 style="color: #10b981; font-size: 28px; margin-bottom: 16px;">FileNova Pro Activated ✅</h1>
        <p style="font-size: 16px; margin-bottom: 16px;">Your ${plan} subscription is now active!</p>
        <div style="background: #1e1b4b; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <p style="margin: 8px 0;"><strong>Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
          <p style="margin: 8px 0;"><strong>Expires:</strong> ${expiryDate}</p>
        </div>
        <h3 style="color: #818cf8; margin-bottom: 8px;">Pro features unlocked:</h3>
        <ul style="margin-bottom: 16px; padding-left: 20px;">
          <li>Unlimited daily file operations</li>
          <li>Files up to 100MB</li>
          <li>Priority processing queue</li>
          <li>Advanced editing tools</li>
        </ul>
        <a href="https://filenova.in/dashboard" style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "FileNova Pro Activated ✅",
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send subscription email:", error);
    return false;
  }
}

export async function sendUPIPaymentReceived(email: string, utrId: string, plan: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Payment Received</title></head>
    <body style="font-family: 'Inter', sans-serif; background: #0f0f1a; color: #f8fafc; padding: 32px;">
      <div style="max-width: 600px; margin: 0 auto; background: #111827; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
        <h1 style="color: #f59e0b; font-size: 28px; margin-bottom: 16px;">Payment Received - Verification Pending</h1>
        <p style="font-size: 16px; margin-bottom: 16px;">We received your UPI payment:</p>
        <div style="background: #1e1b4b; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <p style="margin: 8px 0;"><strong>UTR ID:</strong> ${utrId}</p>
          <p style="margin: 8px 0;"><strong>Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
        </div>
        <p style="margin-bottom: 16px;">We'll verify and upgrade your account within 2-4 hours. You'll receive a confirmation email once approved.</p>
        <p style="font-size: 14px; color: #94a3b8;">Thank you for supporting FileNova!</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Payment Received - Verification Pending",
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send UPI received email:", error);
    return false;
  }
}

export async function sendUPIPaymentApproved(email: string, plan: string, expiry: Date): Promise<boolean> {
  const expiryDate = expiry.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>FileNova Pro Active!</title></head>
    <body style="font-family: 'Inter', sans-serif; background: #0f0f1a; color: #f8fafc; padding: 32px;">
      <div style="max-width: 600px; margin: 0 auto; background: #111827; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
        <h1 style="color: #10b981; font-size: 28px; margin-bottom: 16px;">FileNova Pro is now Active! 🎉</h1>
        <p style="font-size: 16px; margin-bottom: 16px;">Your payment has been verified and your subscription is active!</p>
        <div style="background: #1e1b4b; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <p style="margin: 8px 0;"><strong>Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
          <p style="margin: 8px 0;"><strong>Expires:</strong> ${expiryDate}</p>
        </div>
        <a href="https://filenova.in/login" style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Login & Start Using Pro</a>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "FileNova Pro is now Active! 🎉",
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send UPI approved email:", error);
    return false;
  }
}

export async function sendSubscriptionRenewalNotice(
  email: string,
  plan: string,
  expiry: Date,
  daysRemaining: number
): Promise<boolean> {
  const expiryDate = expiry.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Renew Your FileNova Subscription</title></head>
    <body style="font-family: 'Inter', sans-serif; background: #0f0f1a; color: #f8fafc; padding: 32px;">
      <div style="max-width: 600px; margin: 0 auto; background: #111827; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
        <h1 style="color: #f59e0b; font-size: 28px; margin-bottom: 16px;">Renew Your Subscription ⏳</h1>
        <p style="font-size: 16px; margin-bottom: 16px;">Your ${plan} subscription is expiring soon!</p>
        <div style="background: #1e1b4b; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <p style="margin: 8px 0;"><strong>Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
          <p style="margin: 8px 0;"><strong>Expires on:</strong> ${expiryDate}</p>
          <p style="margin: 8px 0; color: #f87171;"><strong>Time remaining:</strong> ${daysRemaining} day${daysRemaining > 1 ? "s" : ""}</p>
        </div>
        <p style="margin-bottom: 16px;">To prevent interruption to your unlimited files and premium features, please renew your subscription now.</p>
        <a href="https://filenova.in/pricing" style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Renew Now</a>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Renew Your FileNova Subscription - ${daysRemaining} Day${daysRemaining > 1 ? "s" : ""} Left ⏳`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send renewal notification email:", error);
    return false;
  }
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>FileNova OTP Verification</title></head>
    <body style="font-family: 'Inter', sans-serif; background: #0f0f1a; color: #f8fafc; padding: 32px;">
      <div style="max-width: 600px; margin: 0 auto; background: #111827; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
        <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 16px;">Verify Your Account 🔐</h1>
        <p style="font-size: 16px; margin-bottom: 16px;">Here is your 4-digit verification code:</p>
        <div style="background: #1e1b4b; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 16px;">
          <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #f97316;">${otp}</span>
        </div>
        <p style="margin-bottom: 16px; font-size: 14px; color: #94a3b8;">This code will expire in 10 minutes. If you did not request this verification, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `FileNova Verification Code: ${otp}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}

export const emailService = {
  sendWelcomeEmail,
  sendSubscriptionConfirmation,
  sendUPIPaymentReceived,
  sendUPIPaymentApproved,
  sendSubscriptionRenewalNotice,
  sendOtpEmail,
};

export default emailService;