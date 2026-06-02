ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" varchar(8);

DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_referral_code_unique" UNIQUE ("referral_code");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "referrals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "referrer_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "referred_email" varchar(320),
  "status" varchar(50) DEFAULT 'pending' NOT NULL,
  "reward_given" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
