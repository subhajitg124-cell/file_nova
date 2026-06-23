import { db, usersTable, subscriptionsTable, upiPaymentsTable, couponsTable, referralsTable, referralRewardsTable } from "@workspace/db";
import { eq, desc, count, and } from "drizzle-orm";
import { logger } from "../lib/logger";
import { handleUserReferrerUpgradeReward } from "./referralService";

export class AdminPaymentService {
  public static async getPendingUpiPayments() {
    return db
      .select()
      .from(upiPaymentsTable)
      .where(eq(upiPaymentsTable.status, "pending"))
      .orderBy(desc(upiPaymentsTable.createdAt));
  }

  public static async approveUpiPayment(paymentId: string): Promise<boolean> {
    try {
      const [payment] = await db
        .select()
        .from(upiPaymentsTable)
        .where(eq(upiPaymentsTable.id, paymentId))
        .limit(1);

      if (!payment) {
        throw new Error("UPI payment record not found.");
      }

      if (payment.status !== "pending") {
        throw new Error("UPI payment has already been processed.");
      }

      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, payment.email.toLowerCase()))
        .limit(1);

      if (!user) {
        throw new Error("No registered FileNova user exists for this email.");
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days default

      // Insert active subscription
      const [newSub] = await db.insert(subscriptionsTable).values({
        userId: user.id,
        plan: payment.plan,
        status: "active",
        amount: payment.amount * 100, // convert rupees to paise
        currency: "INR",
        razorpayPaymentId: `upi_${payment.utrId}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: expiresAt,
      }).returning();

      // Upgrade user tier
      await db
        .update(usersTable)
        .set({
          premiumTier: payment.plan,
          premiumEnabled: true,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, user.id));

      // Mark payment approved
      await db
        .update(upiPaymentsTable)
        .set({ status: "approved", updatedAt: new Date() })
        .where(eq(upiPaymentsTable.id, paymentId));

      // Trigger referral reward check
      try {
        await handleUserReferrerUpgradeReward(user.id);
      } catch (err) {
        logger.error({ err }, "Referrer reward check failed on UPI approval");
      }

      logger.info({ paymentId, email: payment.email }, "UPI payment verified and approved successfully");
      return true;
    } catch (err: any) {
      logger.error({ err, paymentId }, "Failed to approve UPI payment");
      throw err;
    }
  }

  public static async rejectUpiPayment(paymentId: string): Promise<boolean> {
    try {
      const [payment] = await db
        .select()
        .from(upiPaymentsTable)
        .where(eq(upiPaymentsTable.id, paymentId))
        .limit(1);

      if (!payment) {
        throw new Error("UPI payment record not found.");
      }

      if (payment.status !== "pending") {
        throw new Error("UPI payment has already been processed.");
      }

      // Mark payment rejected
      await db
        .update(upiPaymentsTable)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(upiPaymentsTable.id, paymentId));

      logger.info({ paymentId, email: payment.email }, "UPI payment rejected");
      return true;
    } catch (err: any) {
      logger.error({ err, paymentId }, "Failed to reject UPI payment");
      throw err;
    }
  }

  public static async getSystemAnalytics() {
    try {
      const allSubs = await db.select().from(subscriptionsTable).orderBy(desc(subscriptionsTable.createdAt));
      const activeSubs = allSubs.filter(s => s.status === "active");

      const basic = activeSubs.filter(s => s.plan === "basic").length;
      const pro = activeSubs.filter(s => s.plan === "pro").length;
      const elite = activeSubs.filter(s => s.plan === "elite").length;
      const revenueInPaise = activeSubs.reduce((sum, s) => sum + (s.amount || 0), 0);

      const recentSubs = allSubs.slice(0, 10);
      const recentSignups: any[] = [];
      for (const sub of recentSubs) {
        try {
          const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sub.userId)).limit(1);
          if (user) {
            recentSignups.push({
              name: user.name || "Anonymous",
              email: user.email,
              plan: sub.plan,
              status: sub.status,
              date: sub.createdAt,
            });
          }
        } catch (_) {}
      }

      const allUsers = await db.select().from(usersTable);

      return {
        totalUsers: allUsers.length,
        totalSubscribers: activeSubs.length,
        activeBasic: basic,
        activePro: pro,
        activeElite: elite,
        totalMtdRevenueInRupees: Math.round(revenueInPaise / 100),
        recentSignups,
      };
    } catch (err) {
      logger.error({ err }, "Failed to compile system analytics");
      throw err;
    }
  }
}
