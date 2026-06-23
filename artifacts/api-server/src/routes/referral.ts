import { Router } from "express";
import { z } from "zod";
import { db, referralsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { completeReferral, ensureUserReferralCode, trackReferralClick } from "../services/referralService";

const router = Router();

router.post("/track", async (req, res): Promise<void> => {
  try {
    const { referralCode } = z.object({ referralCode: z.string().min(1).max(8) }).parse(req.body);
    const referral = await trackReferralClick(referralCode);
    if (!referral) {
      res.status(404).json({ success: false, error: "Referral code not found" });
      return;
    }
    res.json({ success: true, referralId: referral.id });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, error: err.message || "Failed to track referral" });
  }
});

router.post("/complete", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const bodySchema = z.object({
      referralCode: z.string().min(1).max(8),
      referralTrackingId: z.string().uuid().optional().nullable(),
    });
    const parsed = bodySchema.parse(req.body);
    const referral = await completeReferral(parsed.referralCode, req.user!.id, req.user!.email, parsed.referralTrackingId ?? undefined);
    res.json({ success: true, referral });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, error: err.message || "Failed to complete referral" });
  }
});

function obfuscateEmail(email: string | null | undefined): string {
  if (!email) return "anonymous";
  const [local, domain] = email.split("@");
  if (!domain) return local;
  if (local.length <= 3) {
    return `${local.substring(0, 1)}***@${domain}`;
  }
  return `${local.substring(0, 3)}***@${domain}`;
}

router.get("/stats", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const referralCode = await ensureUserReferralCode(req.user!.id);
    const referrals = await db.select().from(referralsTable).where(eq(referralsTable.referrerUserId, req.user!.id));
    const successful = referrals.filter((referral) => referral.status === "completed").length;
    let rewardsEarned = 0;
    for (const ref of referrals) {
      if (ref.rewardGiven) rewardsEarned += 3;
      if (ref.upgradeRewardGiven) rewardsEarned += 7;
    }

    const referralList = referrals.map((r) => ({
      id: r.id,
      email: obfuscateEmail(r.referredEmail),
      status: r.status,
      rewardGiven: r.rewardGiven,
      upgradeRewardGiven: r.upgradeRewardGiven,
      createdAt: r.createdAt,
    }));

    res.json({
      success: true,
      referralCode,
      referralLink: `https://filenova.in/ref?code=${referralCode}`,
      stats: {
        totalReferred: referrals.length,
        successfulSignups: successful,
        rewardsEarned,
      },
      referrals: referralList,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to load referral stats" });
  }
});

export default router;
