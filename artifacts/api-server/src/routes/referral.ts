import { Router } from "express";
import { z } from "zod";
import { db, referralsTable, usersTable, referralRewardsTable } from "@workspace/db";
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

    // 3. Fetch all referral rewards for this user (both commissions and bonus days)
    const rewards = await db
      .select()
      .from(referralRewardsTable)
      .where(eq(referralRewardsTable.referrerUserId, userId));

    // 4. Calculate actual statistics
    const totalClicks = referrals.length;
    const registeredCount = referrals.filter((r) => r.status === "completed").length;

    let verifiedCount = 0;
    let premiumCount = 0;

    const referralList = referrals.map((r) => {
      const emailLower = r.referredEmail?.toLowerCase();
      const matchedUser = emailLower ? referredUsersMap.get(emailLower) : null;
      
      const isVerified = matchedUser ? matchedUser.phoneVerified : false;
      const isPremium = matchedUser ? matchedUser.premiumEnabled : false;

      if (r.status === "completed") {
        if (isVerified) verifiedCount++;
        if (isPremium) premiumCount++;
      }

      return {
        id: r.id,
        email: obfuscateEmail(r.referredEmail),
        friendName: matchedUser?.name || null,
        status: r.status,
        phoneVerified: isVerified,
        premiumEnabled: isPremium,
        rewardGiven: r.rewardGiven,
        upgradeRewardGiven: r.upgradeRewardGiven,
        createdAt: r.createdAt,
        signupDate: matchedUser?.createdAt || null,
      };
    });

    const conversionRate = totalClicks > 0 ? Math.round((registeredCount / totalClicks) * 100) : 0;

    // Calculate Pro Days Rewards:
    // 3 days for each completed signup (status = 'completed')
    // 7 days for each premium upgrade (upgradeRewardGiven = true)
    // plus any extra bonus_days rewards in referralRewardsTable (e.g. milestones or custom rewards)
    const signupRewardsDays = registeredCount * 3;
    const upgradeRewardsDays = referrals.filter((r) => r.upgradeRewardGiven).length * 7;
    const extraBonusDays = rewards
      .filter((r) => r.rewardType === "bonus_days" && r.status === "approved")
      .reduce((sum, r) => sum + r.rewardValue, 0);

    const totalProDaysEarned = signupRewardsDays + upgradeRewardsDays + extraBonusDays;
    const equivalentInrSaved = totalProDaysEarned * 3.30;

    // Calculate Cash Commissions:
    // Pending Rewards: rewardType = 'commission' and status = 'pending'
    const pendingRewardsCash = rewards
      .filter((r) => r.rewardType === "commission" && r.status === "pending")
      .reduce((sum, r) => sum + r.rewardValue, 0) / 100; // convert paise to INR

    // Available Rewards: rewardType = 'commission' and status = 'approved'
    const availableRewardsCash = rewards
      .filter((r) => r.rewardType === "commission" && r.status === "approved")
      .reduce((sum, r) => sum + r.rewardValue, 0) / 100; // convert paise to INR

    // Paid Rewards: rewardType = 'commission' and status = 'paid'
    const paidRewardsCash = rewards
      .filter((r) => r.rewardType === "commission" && r.status === "paid")
      .reduce((sum, r) => sum + r.rewardValue, 0) / 100; // convert paise to INR

    // 5. Build Reward Credit History
    const rewardHistory = rewards.map((rw) => {
      const matchedUser = rw.referredUserId ? [...referredUsersMap.values()].find(u => u.id === rw.referredUserId) : null;
      return {
        id: rw.id,
        rewardType: rw.rewardType,
        rewardValue: rw.rewardType === "commission" ? rw.rewardValue / 100 : rw.rewardValue,
        status: rw.status,
        notes: rw.notes,
        createdAt: rw.createdAt,
        friendName: matchedUser?.name || null,
        friendEmail: obfuscateEmail(matchedUser?.email),
      };
    });

    res.json({
      success: true,
      referralCode,
      referralLink: `https://filenova.in/ref?code=${referralCode}`,
      stats: {
        totalReferred: totalClicks,
        successfulSignups: registeredCount,
        verifiedUsers: verifiedCount,
        premiumConversions: premiumCount,
        conversionRate,
        rewardsEarned: totalProDaysEarned,
        equivalentInrSaved,
        pendingRewards: pendingRewardsCash,
        availableRewards: availableRewardsCash,
        paidRewards: paidRewardsCash,
      },
      referrals: referralList,
      rewards: rewardHistory,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to load referral stats" });
  }
});

export default router;
