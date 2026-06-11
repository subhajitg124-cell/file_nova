import { db, subscriptionsTable, usersTable } from "@workspace/db";
import { and, eq, gt, lt, or, isNull } from "drizzle-orm";
import { sendSubscriptionRenewalNotice } from "./emailService";
import { logger } from "../lib/logger";

export async function checkAndSendRenewalNotifications() {
  logger.info("Running scheduled subscription renewal notification check...");

  try {
    const now = new Date();
    // Ending period: expiring in the next 5 days
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    // Notification throttle: at most once every 24 hours
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const expiringSubscriptions = await db
      .select({
        subscription: subscriptionsTable,
        userEmail: usersTable.email,
      })
      .from(subscriptionsTable)
      .innerJoin(usersTable, eq(subscriptionsTable.userId, usersTable.id))
      .where(
        and(
          eq(subscriptionsTable.status, "active"),
          gt(subscriptionsTable.currentPeriodEnd, now),
          lt(subscriptionsTable.currentPeriodEnd, fiveDaysFromNow),
          or(
            isNull(subscriptionsTable.lastRenewalNotificationSentAt),
            lt(subscriptionsTable.lastRenewalNotificationSentAt, twentyFourHoursAgo)
          )
        )
      );

    logger.info({ count: expiringSubscriptions.length }, "Found expiring subscriptions eligible for renewal notification");

    let successCount = 0;

    for (const entry of expiringSubscriptions) {
      const sub = entry.subscription;
      const email = entry.userEmail;

      if (!sub.currentPeriodEnd) continue;

      const timeDiff = sub.currentPeriodEnd.getTime() - now.getTime();
      const daysRemaining = Math.max(1, Math.ceil(timeDiff / (24 * 60 * 60 * 1000)));

      logger.info({ userId: sub.userId, email, daysRemaining }, "Sending subscription renewal notification");

      try {
        const sent = await sendSubscriptionRenewalNotice(
          email,
          sub.plan,
          sub.currentPeriodEnd,
          daysRemaining
        );

        if (sent) {
          await db
            .update(subscriptionsTable)
            .set({ lastRenewalNotificationSentAt: now })
            .where(eq(subscriptionsTable.id, sub.id));
          successCount++;
        }
      } catch (err) {
        logger.error({ err, subscriptionId: sub.id, email }, "Failed to process renewal notification for subscription");
      }
    }

    if (successCount > 0) {
      logger.info({ successCount }, "Successfully sent subscription renewal notifications");
    }
  } catch (err) {
    logger.error({ err }, "Error running subscription renewal notification check");
  }
}
