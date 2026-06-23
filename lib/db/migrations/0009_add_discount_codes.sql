-- Discount Code type enum
CREATE TYPE "discount_code_type" AS ENUM('percentage', 'fixed');

-- discount_codes table
CREATE TABLE "discount_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(30) NOT NULL,
	"type" "discount_code_type" DEFAULT 'percentage' NOT NULL,
	"value" integer NOT NULL,
	"max_discount" integer,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone NOT NULL,
	"usage_limit" integer DEFAULT 1 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"per_user_limit" integer DEFAULT 1 NOT NULL,
	"applicable_plans" jsonb DEFAULT '["basic","pro","elite"]' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);

-- discount_code_usages table
CREATE TABLE "discount_code_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discount_code_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" varchar(100),
	"discount_amount" integer NOT NULL,
	"original_amount" integer NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Foreign keys
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_created_by_users_id_fk"
	FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "discount_code_usages" ADD CONSTRAINT "discount_code_usages_discount_code_id_discount_codes_id_fk"
	FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "discount_code_usages" ADD CONSTRAINT "discount_code_usages_user_id_users_id_fk"
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

-- Indexes
CREATE INDEX "discount_codes_code_idx" ON "discount_codes" ("code");
CREATE INDEX "discount_codes_is_active_idx" ON "discount_codes" ("is_active");
CREATE INDEX "discount_codes_valid_from_valid_until_idx" ON "discount_codes" ("valid_from", "valid_until");
CREATE INDEX "discount_code_usages_discount_code_id_idx" ON "discount_code_usages" ("discount_code_id");
CREATE INDEX "discount_code_usages_user_id_idx" ON "discount_code_usages" ("user_id");
