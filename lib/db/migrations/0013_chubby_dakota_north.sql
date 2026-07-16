DROP TABLE "coupon_usages" CASCADE;--> statement-breakpoint
DROP TABLE "coupons" CASCADE;--> statement-breakpoint
DROP TABLE "discount_code_usages" CASCADE;--> statement-breakpoint
DROP TABLE "discount_codes" CASCADE;--> statement-breakpoint
DROP TABLE "payment_events" CASCADE;--> statement-breakpoint
DROP TABLE "payment_orders" CASCADE;--> statement-breakpoint
DROP TABLE "referral_rewards" CASCADE;--> statement-breakpoint
DROP TABLE "subscriptions" CASCADE;--> statement-breakpoint
DROP TABLE "upi_payments" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "payment_verified_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "premium_enabled";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "premium_tier";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "plan";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "plan_expires_at";--> statement-breakpoint
DROP TYPE "public"."coupon_type";--> statement-breakpoint
DROP TYPE "public"."discount_code_type";