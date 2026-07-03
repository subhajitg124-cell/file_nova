import { pgTable, uuid, varchar, integer, timestamp, text, jsonb, index } from "drizzle-orm/pg-core";
import { usersTable } from "./index";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentEventsTable = pgTable("payment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: varchar("event_id", { length: 255 }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  orderId: varchar("order_id", { length: 64 }),
  paymentId: varchar("payment_id", { length: 64 }),
  subscriptionId: uuid("subscription_id"),
  payload: jsonb("payload"),
  status: varchar("status", { length: 32 }).notNull().default("received"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    eventIdIdx: index("payment_events_event_id_idx").on(table.eventId),
    eventTypeIdx: index("payment_events_event_type_idx").on(table.eventType),
    orderIdIdx: index("payment_events_order_id_idx").on(table.orderId),
    userIdIdx: index("payment_events_user_id_idx").on(table.userId),
  };
});

export type PaymentEvent = typeof paymentEventsTable.$inferSelect;
export type InsertPaymentEvent = z.infer<typeof insertPaymentEventSchema>;
export const insertPaymentEventSchema = createInsertSchema(paymentEventsTable).omit({ id: true, createdAt: true });
