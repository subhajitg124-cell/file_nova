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

export async function trackReferralClick(referralCode: string) {
  const [referrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode)).limit(1);
  if (!referrer) return null;

  const [referral] = await db.insert(referralsTable).values({
    referrerUserId: referrer.id,
    status: "pending",
    rewardGiven: false,
  }).returning();

  return referral;
}

export async function completeReferral(referralCode: string | null | undefined, referredUserId: string, referredEmail: string, trackingId?: string) {
  if (!referralCode) return null;

  const [referrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode)).limit(1);
  if (!referrer || referrer.id === referredUserId) return null;

  // If we have a tracking ID from /track, find and update that exact pending record
  if (trackingId) {
    const [tracked] = await db
      .select()
      .from(referralsTable)
      .where(and(eq(referralsTable.id, trackingId), eq(referralsTable.referrerUserId, referrer.id)))
      .limit(1);

    if (tracked && tracked.status === "pending" && !tracked.rewardGiven) {
      const [updated] = await db
        .update(referralsTable)
        .set({
          referredEmail,
          status: "completed",
          rewardGiven: true,
        })
        .where(eq(referralsTable.id, tracked.id))
        .returning();

      await grantReferralReward(referrer.id, 3);
      await grantReferralReward(referredUserId, 3);
      return updated;
    }
  }

  // Fallback: find any pending referral from this referrer without an email
  const [pendingReferral] = await db
    .select()
    .from(referralsTable)
    .where(and(
      eq(referralsTable.referrerUserId, referrer.id),
      eq(referralsTable.status, "pending"),
    ))
    .limit(1);

  if (pendingReferral && !pendingReferral.rewardGiven) {
    const [updated] = await db
      .update(referralsTable)
      .set({
        referredEmail,
        status: "completed",
        rewardGiven: true,
      })
      .where(eq(referralsTable.id, pendingReferral.id))
      .returning();

    await grantReferralReward(referrer.id, 3);
    await grantReferralReward(referredUserId, 3);
    return updated;
  }

  // Last resort: check for existing completed referral (idempotency)
  const [existingCompleted] = await db
    .select()
    .from(referralsTable)
    .where(and(eq(referralsTable.referrerUserId, referrer.id), eq(referralsTable.referredEmail, referredEmail)))
    .limit(1);

  if (existingCompleted?.rewardGiven) return existingCompleted;

  // No pending record found — create a new completed one
  const [referral] = await db.insert(referralsTable).values({
    referrerUserId: referrer.id,
    referredEmail,
    status: "completed",
    rewardGiven: true,
  }).returning();

  await grantReferralReward(referrer.id, 3);
  await grantReferralReward(referredUserId, 3);
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

    if (referral) {
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
