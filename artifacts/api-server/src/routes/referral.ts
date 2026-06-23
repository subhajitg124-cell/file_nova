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

router.get("/stats", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const referralCode = await ensureUserReferralCode(req.user!.id);
    const referrals = await db.select().from(referralsTable).where(eq(referralsTable.referrerUserId, req.user!.id));
    const successful = referrals.filter((referral) => referral.status === "completed").length;
    const rewardsEarned = referrals.filter((referral) => referral.rewardGiven).length * 7;

    res.json({
      success: true,
      referralCode,
      stats: {
        totalReferred: referrals.length,
        successfulSignups: successful,
        rewardsEarned,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to load referral stats" });
  }
});

export default router;
