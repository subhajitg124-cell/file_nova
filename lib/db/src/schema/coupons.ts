import { pgTable, uuid, varchar, integer, timestamp, boolean, jsonb, pgEnum, text, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./index";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const couponTypeEnum = pgEnum("coupon_type", ["percentage", "fixed", "free_uploads", "extended_validity"]);
export const discountCodeTypeEnum = pgEnum("discount_code_type", ["percentage", "fixed"]);

export const couponsTable = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  type: couponTypeEnum("type").notNull(),
  value: integer("value").notNull(), // percentage for percentage type, amount in paise for fixed, number of uploads for free_uploads, days for extended_validity
  minPurchase: integer("min_purchase"), // minimum purchase amount in paise (for percentage/fixed types)
  maxDiscount: integer("max_discount"), // maximum discount amount in paise (for percentage type)
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
  usageLimit: integer("usage_limit").notNull(), // total usage limit
  usedCount: integer("used_count").notNull().default(0), // current usage count
  applicablePlans: jsonb("applicable_plans").$type<Array<"free" | "basic" | "pro" | "elite">>().notNull().default(["free", "basic", "pro", "elite"]),
  applicableTools: jsonb("applicable_tools").$type<string[]>().notNull().default([]), // empty array means all tools
  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by").references(() => usersTable.id),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const couponUsagesTable = pgTable("coupon_usages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  couponId: uuid("coupon_id").notNull().references(() => couponsTable.id, { onDelete: "cascade" }),
  discountAmount: integer("discount_amount").notNull(), // amount saved in paise
  originalAmount: integer("original_amount").notNull(), // original amount in paise
  usedAt: timestamp("used_at", { withTimezone: true }).notNull().defaultNow(),
});

export const discountCodesTable = pgTable("discount_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  type: discountCodeTypeEnum("type").notNull().default("percentage"),
  value: integer("value").notNull(), // percentage (1-100) for percentage type, amount in paise for fixed
  maxDiscount: integer("max_discount"), // max discount in paise (for percentage type)
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
  usageLimit: integer("usage_limit").notNull().default(1),
  usedCount: integer("used_count").notNull().default(0),
  perUserLimit: integer("per_user_limit").notNull().default(1),
  applicablePlans: jsonb("applicable_plans").$type<Array<"free" | "basic" | "pro" | "elite">>().notNull().default(["basic", "pro", "elite"]),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  createdBy: uuid("created_by").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const discountCodeUsagesTable = pgTable("discount_code_usages", {
  id: uuid("id").primaryKey().defaultRandom(),
  discountCodeId: uuid("discount_code_id").notNull().references(() => discountCodesTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  orderId: varchar("order_id", { length: 100 }),
  discountAmount: integer("discount_amount").notNull(),
  originalAmount: integer("original_amount").notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }).notNull().defaultNow(),
});

export const discountCodesRelations = relations(discountCodesTable, ({ many }) => ({
  usages: many(discountCodeUsagesTable),
}));

export const discountCodeUsagesRelations = relations(discountCodeUsagesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [discountCodeUsagesTable.userId],
    references: [usersTable.id],
  }),
  discountCode: one(discountCodesTable, {
    fields: [discountCodeUsagesTable.discountCodeId],
    references: [discountCodesTable.id],
  }),
}));

export const couponsRelations = relations(couponsTable, ({ many, one }) => ({
  usages: many(couponUsagesTable),
  creator: one(usersTable, {
    fields: [couponsTable.createdBy],
    references: [usersTable.id],
  }),
}));

export const couponUsagesRelations = relations(couponUsagesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [couponUsagesTable.userId],
    references: [usersTable.id],
  }),
  coupon: one(couponsTable, {
    fields: [couponUsagesTable.couponId],
    references: [couponsTable.id],
  }),
}));

export const insertCouponSchema = createInsertSchema(couponsTable).omit({ id: true, createdAt: true, updatedAt: true, usedCount: true });
export const insertCouponUsageSchema = createInsertSchema(couponUsagesTable).omit({ id: true, usedAt: true });
export const insertDiscountCodeSchema = createInsertSchema(discountCodesTable).omit({ id: true, createdAt: true, updatedAt: true, usedCount: true });
export const insertDiscountCodeUsageSchema = createInsertSchema(discountCodeUsagesTable).omit({ id: true, usedAt: true });

export type Coupon = typeof couponsTable.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type CouponUsage = typeof couponUsagesTable.$inferSelect;
export type InsertCouponUsage = z.infer<typeof insertCouponUsageSchema>;
export type DiscountCode = typeof discountCodesTable.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCodeUsage = typeof discountCodeUsagesTable.$inferSelect;
export type InsertDiscountCodeUsage = z.infer<typeof insertDiscountCodeUsageSchema>;