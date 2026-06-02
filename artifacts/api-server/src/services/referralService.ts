import crypto from "node:crypto";
import { db, referralsTable, subscriptionsTable, usersTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";

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

async function grantReferralReward(userId: string) {
  const now = new Date();
  const rewardEnds = new Date(now.getTime() + REWARD_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(subscriptionsTable).values({
    userId,
    plan: "pro",
    status: "active",
    amount: 0,
    currency: "INR",
    currentPeriodStart: now,
    currentPeriodEnd: rewardEnds,
  });

  await db.update(usersTable).set({
    premiumEnabled: true,
    premiumTier: "pro",
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

export async function completeReferral(referralCode: string | null | undefined, referredUserId: string, referredEmail: string) {
  if (!referralCode) return null;

  const [referrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode)).limit(1);
  if (!referrer || referrer.id === referredUserId) return null;

  const [existingCompleted] = await db
    .select()
    .from(referralsTable)
    .where(and(eq(referralsTable.referrerUserId, referrer.id), eq(referralsTable.referredEmail, referredEmail)))
    .limit(1);

  if (existingCompleted?.rewardGiven) return existingCompleted;

  const [referral] = existingCompleted
    ? await db.update(referralsTable).set({
        status: "completed",
        rewardGiven: true,
      }).where(eq(referralsTable.id, existingCompleted.id)).returning()
    : await db.insert(referralsTable).values({
        referrerUserId: referrer.id,
        referredEmail,
        status: "completed",
        rewardGiven: true,
      }).returning();

  await grantReferralReward(referrer.id);
  await grantReferralReward(referredUserId);
  return referral;
}
