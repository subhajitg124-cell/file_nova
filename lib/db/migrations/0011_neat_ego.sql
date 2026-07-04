CREATE TABLE "otp_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"code" varchar(255) NOT NULL,
	"type" varchar(10) NOT NULL,
	"target" varchar(100) NOT NULL,
	"purpose" varchar(20) DEFAULT 'payment' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar(255),
	"event_type" varchar(100) NOT NULL,
	"user_id" uuid,
	"order_id" varchar(64),
	"payment_id" varchar(64),
	"subscription_id" uuid,
	"payload" jsonb,
	"status" varchar(32) DEFAULT 'received' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file_history" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "file_history" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payment_orders" ADD COLUMN "billing_cycle" varchar(10) DEFAULT 'monthly';--> statement-breakpoint
ALTER TABLE "payment_orders" ADD COLUMN "signature" varchar(128);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "upi_payments" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "upi_payments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "payment_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan" varchar(16) DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "otp_verifications_user_id_idx" ON "otp_verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_events_event_id_idx" ON "payment_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "payment_events_event_type_idx" ON "payment_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "payment_events_order_id_idx" ON "payment_events" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_events_user_id_idx" ON "payment_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "file_history_user_id_idx" ON "file_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "file_history_processed_at_idx" ON "file_history" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payment_orders_user_id_idx" ON "payment_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_orders_status_idx" ON "payment_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_orders_payment_id_idx" ON "payment_orders" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "referral_rewards_referrer_idx" ON "referral_rewards" USING btree ("referrer_user_id");--> statement-breakpoint
CREATE INDEX "referral_rewards_status_idx" ON "referral_rewards" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_payment_id_idx" ON "subscriptions" USING btree ("razorpay_payment_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");