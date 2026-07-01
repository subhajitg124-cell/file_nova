
import { pgTable, uuid, varchar, integer, timestamp, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./index";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  plan: varchar("plan", { length: 50 }).notNull().default("free"), // free, basic, pro, elite
  status: varchar("status", { length: 50 }).notNull().default("pending"), // active, cancelled, expired, pending
  amount: integer("amount").notNull().default(0), // In paise
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }).unique(),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 255 }),
  couponCode: varchar("coupon_code", { length: 20 }), // Coupon code used for this subscription
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  lastRenewalNotificationSentAt: timestamp("last_renewal_notification_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptionsRelations = relations(subscriptionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [subscriptionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const upiPaymentsTable = pgTable("upi_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull(),
  utrId: varchar("utr_id", { length: 12 }).notNull().unique(),
  plan: varchar("plan", { length: 50 }).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const referralRewardsTable = pgTable("referral_rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerUserId: uuid("referrer_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  referredUserId: uuid("referred_user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(() => subscriptionsTable.id, { onDelete: "cascade" }),
  rewardType: varchar("reward_type", { length: 50 }).notNull(), // 'commission', 'bonus_days', 'discount_coupon'
  rewardValue: integer("reward_value").notNull(), // commission in paise, bonus_days in count, etc.
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'approved', 'paid', 'cancelled'
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const referralRewardsRelations = relations(referralRewardsTable, ({ one }) => ({
  referrer: one(usersTable, {
    fields: [referralRewardsTable.referrerUserId],
    references: [usersTable.id],
  }),
  referred: one(usersTable, {
    fields: [referralRewardsTable.referredUserId],
    references: [usersTable.id],
  }),
  subscription: one(subscriptionsTable, {
    fields: [referralRewardsTable.subscriptionId],
    references: [subscriptionsTable.id],
  }),
}));

export const paymentOrders = pgTable('payment_orders', {
  id: varchar('id', { length: 64 }).primaryKey(), // Razorpay order ID
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  planId: varchar('plan_id', { length: 32 }).notNull(),
  amount: integer('amount').notNull(),             // in paise
  currency: varchar('currency', { length: 3 }).default('INR'),
  status: varchar('status', { length: 16 }).default('created'),
  paymentId: varchar('payment_id', { length: 64 }), // Razorpay payment ID
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUPIPaymentSchema = createInsertSchema(upiPaymentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReferralRewardSchema = createInsertSchema(referralRewardsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentOrderSchema = createInsertSchema(paymentOrders);

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type UPIPayment = typeof upiPaymentsTable.$inferSelect;
export type InsertUPIPayment = z.infer<typeof insertUPIPaymentSchema>;
export type ReferralReward = typeof referralRewardsTable.$inferSelect;
export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type PaymentOrder = typeof paymentOrders.$inferSelect;
export type InsertPaymentOrder = z.infer<typeof insertPaymentOrderSchema>;

