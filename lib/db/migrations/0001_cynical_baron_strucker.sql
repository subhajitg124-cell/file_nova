CREATE TABLE "ip_usage" (
	"ip_address" varchar(45) PRIMARY KEY NOT NULL,
	"usage_today" integer DEFAULT 0 NOT NULL,
	"last_used_at" varchar(20) DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "usage_today" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_usage_reset" varchar(20) DEFAULT '' NOT NULL;