import { Router } from "express";
import { z } from "zod";
import { db, referralsTable, usersTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { completeReferral, ensureUserReferralCode, trackReferralClick } from "../services/referralService";

const router = Router();

router.post("/track", async (req, res): Promise<void> => {
  try {
    const { referralCode } = z.object({ referralCode: z.string().min(1).max(8) }).parse(req.body);
    const referral = await trackReferralClick(referralCode, req.ip || undefined, req.headers["user-agent"] || undefined);
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
    const referral = await completeReferral(
      parsed.referralCode,
      req.user!.id,
      req.user!.email,
      parsed.referralTrackingId ?? undefined,
      req.ip || undefined,
      req.headers["user-agent"] || undefined
    );
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
    const userId = req.user!.id;
    const referralCode = await ensureUserReferralCode(userId);

    // 1. Fetch all referrals where this user is the referrer
    const referrals = await db
      .select()
      .from(referralsTable)
      .where(eq(referralsTable.referrerUserId, userId));

    // 2. Fetch referred user details if they registered
    const referredEmails = referrals
      .map((r) => r.referredEmail)
      .filter((email): email is string => !!email);

    const referredUsersMap = new Map<string, any>();
    if (referredEmails.length > 0) {
      const users = await db
        .select()
        .from(usersTable)
        .where(inArray(usersTable.email, referredEmails));
      for (const u of users) {
        referredUsersMap.set(u.email.toLowerCase(), u);
      }
    }

    // 3. Mock empty rewards list
    const rewards: any[] = [];

    // 4. Calculate statistics
    const totalClicks = referrals.length;
    const registeredCount = referrals.filter((r) => r.status === "completed").length;

    let verifiedCount = 0;

    const referralList = referrals.map((r) => {
      const emailLower = r.referredEmail?.toLowerCase();
      const matchedUser = emailLower ? referredUsersMap.get(emailLower) : null;
      
      const isVerified = matchedUser ? matchedUser.phoneVerified : false;

      if (r.status === "completed") {
        if (isVerified) verifiedCount++;
      }

      return {
        id: r.id,
        email: obfuscateEmail(r.referredEmail),
        friendName: matchedUser?.name || null,
        status: r.status,
        phoneVerified: isVerified,
        premiumEnabled: true, // Everyone is premium for free
        rewardGiven: r.rewardGiven,
        upgradeRewardGiven: r.upgradeRewardGiven,
        createdAt: r.createdAt,
        signupDate: matchedUser?.createdAt || null,
      };
    });

    const conversionRate = totalClicks > 0 ? Math.round((registeredCount / totalClicks) * 100) : 0;

    res.json({
      success: true,
      referralCode,
      referralLink: `https://filenova.in/ref?code=${referralCode}`,
      stats: {
        totalReferred: totalClicks,
        successfulSignups: registeredCount,
        verifiedUsers: verifiedCount,
        premiumConversions: registeredCount,
        conversionRate,
        rewardsEarned: 0,
        equivalentInrSaved: 0,
        pendingRewards: 0,
        availableRewards: 0,
        paidRewards: 0,
      },
      referrals: referralList,
      rewards: [],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to load referral stats" });
  }
});

export default router;
