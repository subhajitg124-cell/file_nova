import { db, referralsTable, referralRewardsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../lib/logger";
import { grantReferralReward } from "./referralService";

export class ReferralRewardService {
  public static async processReferralUpgrade(
    referredUserId: string,
    subscriptionId: string,
    amountPaid: number
  ): Promise<void> {
    try {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, referredUserId))
        .limit(1);

      if (!user || !user.email) {
        return;
      }

      // Check if this user was referred by someone and the upgrade reward has not been processed yet
      const [referral] = await db
        .select()
        .from(referralsTable)
        .where(
          and(
            eq(referralsTable.referredEmail, user.email),
            eq(referralsTable.upgradeRewardGiven, false)
          )
        )
        .limit(1);

      if (!referral) {
        return;
      }

      const commissionPercentage = 10; // 10% commission reward
      const commissionAmount = Math.round(amountPaid * (commissionPercentage / 100)); // in paise

      // 1. Record commission reward for referrer
      await db.insert(referralRewardsTable).values({
        referrerUserId: referral.referrerUserId,
        referredUserId: user.id,
        subscriptionId,
        rewardType: "commission",
        rewardValue: commissionAmount,
        status: "approved",
        notes: `10% commission on ${user.email} purchase`,
      });

      // 2. Record bonus premium days reward (7 days) for referrer
      await db.insert(referralRewardsTable).values({
        referrerUserId: referral.referrerUserId,
        referredUserId: user.id,
        subscriptionId,
        rewardType: "bonus_days",
        rewardValue: 7,
        status: "approved",
        notes: `7 bonus days on ${user.email} purchase`,
      });

      // 3. Grant the actual premium extension to referrer
      await grantReferralReward(referral.referrerUserId, 7);

      // 4. Update referral record to mark upgrade reward given
      await db
        .update(referralsTable)
        .set({ upgradeRewardGiven: true })
        .where(eq(referralsTable.id, referral.id));

      logger.info(
        { referrerId: referral.referrerUserId, referredId: user.id },
        "Processed referral upgrade rewards successfully (commission and bonus days)"
      );
    } catch (err) {
      logger.error({ err }, "Error processing referral upgrade rewards");
    }
  }

  public static async getUserReferralEarnings(userId: string): Promise<{ totalEarnings: number; pendingPayouts: number }> {
    try {
      const rewards = await db
        .select()
        .from(referralRewardsTable)
        .where(eq(referralRewardsTable.referrerUserId, userId));

      const totalEarnings = rewards
        .filter(r => r.rewardType === "commission")
        .reduce((sum, r) => sum + r.rewardValue, 0);

      const pendingPayouts = rewards
        .filter(r => r.rewardType === "commission" && r.status === "approved")
        .reduce((sum, r) => sum + r.rewardValue, 0);

      return {
        totalEarnings, // in paise
        pendingPayouts, // in paise
      };
    } catch (err) {
      logger.error({ err, userId }, "Failed to get user referral earnings");
      return { totalEarnings: 0, pendingPayouts: 0 };
    }
  }
}
