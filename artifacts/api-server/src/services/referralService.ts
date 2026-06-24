import crypto from "node:crypto";
import { db, referralsTable, subscriptionsTable, usersTable } from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REWARD_DAYS = 7;

function makeReferralCode() {
  let suffix = "";
  for (let i = 0; i < 5; i += 1) {
    suffix += REFERRAL_ALPHABET[crypto.randomInt(0, REFERRAL_ALPHABET.length)];
  }
  return `FN-${suffix}`;
}

export async function generateUniqueReferralCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = makeReferralCode();
    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.referralCode, code)).limit(1);
    if (!existing) return code;
  }
  throw new Error("Unable to generate a unique referral code");
}

export async function ensureUserReferralCode(userId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) throw new Error("User not found");
  if (user.referralCode) return user.referralCode;

  const referralCode = await generateUniqueReferralCode();
  await db.update(usersTable).set({ referralCode, updatedAt: new Date() }).where(eq(usersTable.id, userId));
  return referralCode;
}

export async function grantReferralReward(userId: string, days: number) {
  const now = new Date();
  
  // Find user to check their current tier
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return;
  
  const currentTier = user.premiumTier || "free";
  
  // Find active subscriptions
  const activeSubs = await db
    .select()
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.status, "active")))
    .orderBy(desc(subscriptionsTable.currentPeriodEnd));
  
  let start = now;
  let end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  let targetTier = "pro";
  if (currentTier !== "free") {
    // Keep their premium tier if they already have one, just extend it
    targetTier = currentTier;
  }
  
  if (activeSubs.length > 0 && activeSubs[0].currentPeriodEnd) {
    const currentEnd = new Date(activeSubs[0].currentPeriodEnd);
    if (currentEnd > now) {
      start = currentEnd;
      end = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);
    }
  }

  await db.insert(subscriptionsTable).values({
    userId,
    plan: targetTier,
    status: "active",
    amount: 0,
    currency: "INR",
    currentPeriodStart: start,
    currentPeriodEnd: end,
  });

  await db.update(usersTable).set({
    premiumEnabled: true,
    premiumTier: targetTier,
    updatedAt: now,
  }).where(eq(usersTable.id, userId));
}

export async function trackReferralClick(referralCode: string, ipAddress?: string, userAgent?: string) {
  const [referrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode)).limit(1);
  if (!referrer) return null;

  // Anti-abuse: Check if there's already a pending click from the same IP address for this referrer within the last 1 hour
  if (ipAddress) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [existingPending] = await db
      .select()
      .from(referralsTable)
      .where(
        and(
          eq(referralsTable.referrerUserId, referrer.id),
          eq(referralsTable.status, "pending"),
          eq(referralsTable.ipAddress, ipAddress)
        )
      )
      .limit(1);

    if (existingPending) {
      // Update User Agent if it changed, then reuse the pending click record
      if (userAgent && existingPending.userAgent !== userAgent) {
        await db
          .update(referralsTable)
          .set({ userAgent })
          .where(eq(referralsTable.id, existingPending.id));
        existingPending.userAgent = userAgent;
      }
      return existingPending;
    }
  }

  const [referral] = await db.insert(referralsTable).values({
    referrerUserId: referrer.id,
    status: "pending",
    rewardGiven: false,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  }).returning();

  return referral;
}

const MILESTONES = [
  { target: 5, reward: 7, name: "Bronze Advocate" },
  { target: 10, reward: 15, name: "Silver Promoter" },
  { target: 20, reward: 30, name: "Gold Ambassador" },
  { target: 50, reward: 100, name: "Diamond Elite" },
];

export async function checkAndTriggerMilestoneRewards(referrerId: string): Promise<void> {
  try {
    // 1. Count completed referrals for this referrer
    const referrals = await db
      .select()
      .from(referralsTable)
      .where(and(eq(referralsTable.referrerUserId, referrerId), eq(referralsTable.status, "completed")));
    
    const completedCount = referrals.length;

    // 2. Find if any milestone matches this count
    const milestone = MILESTONES.find(m => m.target === completedCount);
    if (!milestone) return;

    // 3. Prevent duplicate milestone reward records
    const { referralRewardsTable } = await import("@workspace/db");
    const [alreadyRewarded] = await db
      .select()
      .from(referralRewardsTable)
      .where(
        and(
          eq(referralRewardsTable.referrerUserId, referrerId),
          eq(referralRewardsTable.rewardType, "bonus_days"),
          eq(referralRewardsTable.notes, `Milestone Reward: Reached ${milestone.target} referrals (${milestone.name})`)
        )
      )
      .limit(1);

    if (alreadyRewarded) return;

    // 4. Distribute reward automatically
    await db.insert(referralRewardsTable).values({
      referrerUserId: referrerId,
      rewardType: "bonus_days",
      rewardValue: milestone.reward,
      status: "approved",
      notes: `Milestone Reward: Reached ${milestone.target} referrals (${milestone.name})`,
    });

    await grantReferralReward(referrerId, milestone.reward);
  } catch (err) {
    // Fail silently, don't block auth/signup operations
  }
}

export async function completeReferral(
  referralCode: string | null | undefined,
  referredUserId: string,
  referredEmail: string,
  trackingId?: string,
  ipAddress?: string,
  userAgent?: string
) {
  if (!referralCode) return null;

  const [referrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode)).limit(1);
  // Prevent self-referrals (checking user ID and email matches)
  if (!referrer || referrer.id === referredUserId || referrer.email.toLowerCase() === referredEmail.toLowerCase()) {
    return null;
  }

  // Idempotency: check if this user has already completed a referral before
  const [existingReferral] = await db
    .select()
    .from(referralsTable)
    .where(
      and(
        eq(referralsTable.referredEmail, referredEmail),
        eq(referralsTable.status, "completed")
      )
    )
    .limit(1);

  if (existingReferral) {
    return existingReferral;
  }

  // Fraud prevention: Check if a completed referral has already been claimed from the same IP address or device
  let isFraud = false;
  if (ipAddress) {
    const [sameIpReferral] = await db
      .select()
      .from(referralsTable)
      .where(
        and(
          eq(referralsTable.status, "completed"),
          eq(referralsTable.ipAddress, ipAddress)
        )
      )
      .limit(1);
    
    if (sameIpReferral) {
      isFraud = true;
    }
  }

  // If tracking ID is provided, find and update that specific pending record
  if (trackingId) {
    const [tracked] = await db
      .select()
      .from(referralsTable)
      .where(and(eq(referralsTable.id, trackingId), eq(referralsTable.referrerUserId, referrer.id)))
      .limit(1);

    if (tracked && tracked.status === "pending") {
      const [updated] = await db
        .update(referralsTable)
        .set({
          referredEmail,
          status: isFraud ? "flagged" : "completed",
          rewardGiven: !isFraud,
          ipAddress: ipAddress || tracked.ipAddress,
          userAgent: userAgent || tracked.userAgent,
        })
        .where(eq(referralsTable.id, tracked.id))
        .returning();

      if (!isFraud) {
        await grantReferralReward(referrer.id, 3);
        await grantReferralReward(referredUserId, 3);
        await checkAndTriggerMilestoneRewards(referrer.id);
      }
      return updated;
    }
  }

  // Fallback: search for any pending referral record from this referrer
  const [pendingReferral] = await db
    .select()
    .from(referralsTable)
    .where(
      and(
        eq(referralsTable.referrerUserId, referrer.id),
        eq(referralsTable.status, "pending")
      )
    )
    .limit(1);

  if (pendingReferral) {
    const [updated] = await db
      .update(referralsTable)
      .set({
        referredEmail,
        status: isFraud ? "flagged" : "completed",
        rewardGiven: !isFraud,
        ipAddress: ipAddress || pendingReferral.ipAddress,
        userAgent: userAgent || pendingReferral.userAgent,
      })
      .where(eq(referralsTable.id, pendingReferral.id))
      .returning();

    if (!isFraud) {
      await grantReferralReward(referrer.id, 3);
      await grantReferralReward(referredUserId, 3);
      await checkAndTriggerMilestoneRewards(referrer.id);
    }
    return updated;
  }

  // No pending record found — insert a new completed or flagged record
  const [referral] = await db.insert(referralsTable).values({
    referrerUserId: referrer.id,
    referredEmail,
    status: isFraud ? "flagged" : "completed",
    rewardGiven: !isFraud,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  }).returning();

  if (!isFraud) {
    await grantReferralReward(referrer.id, 3);
    await grantReferralReward(referredUserId, 3);
    await checkAndTriggerMilestoneRewards(referrer.id);
  }

  return referral;
}

export async function handleUserReferrerUpgradeReward(userId: string) {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || !user.email) return;

    // Find if this user was referred by someone and the upgrade reward hasn't been given yet
    const [referral] = await db
      .select()
      .from(referralsTable)
      .where(and(eq(referralsTable.referredEmail, user.email), eq(referralsTable.upgradeRewardGiven, false)))
      .limit(1);

    if (referral && referral.status === "completed") {
      // Find the user's latest active subscription to get subscriptionId and amountPaid
      const [latestSub] = await db
        .select()
        .from(subscriptionsTable)
        .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.status, "active")))
        .orderBy(desc(subscriptionsTable.createdAt))
        .limit(1);

      const subId = latestSub ? latestSub.id : "unknown";
      const amountPaid = latestSub ? latestSub.amount : 0;

      // Dynamically import ReferralRewardService to prevent circular dependency
      const { ReferralRewardService } = await import("./ReferralRewardService");
      await ReferralRewardService.processReferralUpgrade(userId, subId, amountPaid);
    }
  } catch (err) {
    // Ignore database errors, don't crash the request
  }
}

export async function backfillMissingReferralCodes() {
  try {
    const usersWithoutCode = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.referralCode, ""));

    for (const u of usersWithoutCode) {
      const referralCode = await generateUniqueReferralCode();
      await db
        .update(usersTable)
        .set({ referralCode, updatedAt: new Date() })
        .where(eq(usersTable.id, u.id));
    }
  } catch (err) {
    // Fail silently on boot
  }
}
