CREATE TABLE "file_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"tool_used" varchar(120) NOT NULL,
	"original_filename" text NOT NULL,
	"file_size" integer NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'completed' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_user_id" uuid NOT NULL,
	"referred_email" varchar(320),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"reward_given" boolean DEFAULT false NOT NULL,
	"upgrade_reward_given" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upi_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"utr_id" varchar(12) NOT NULL,
	"plan" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "upi_payments_utr_id_unique" UNIQUE("utr_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_code" varchar(8);--> statement-breakpoint
ALTER TABLE "file_history" ADD CONSTRAINT "file_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_users_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code");