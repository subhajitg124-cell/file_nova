import { logger } from "../lib/logger";

export class ReferralRewardService {
  public static async processReferralUpgrade(
    referredUserId: string,
    subscriptionId: string,
    amountPaid: number
  ): Promise<void> {
    logger.info("processReferralUpgrade called (No-op in fully free mode)");
  }

  public static async getUserReferralEarnings(userId: string): Promise<{ totalEarnings: number; pendingPayouts: number }> {
    return {
      totalEarnings: 0,
      pendingPayouts: 0,
    };
  }
}
