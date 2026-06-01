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
