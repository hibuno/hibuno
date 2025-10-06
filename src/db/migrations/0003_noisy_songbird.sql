ALTER TABLE "posts" ADD COLUMN "min_price" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "max_price" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "offer_free" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "prev_min_price" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "prev_max_price" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "in_promotion" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "social_medias" text[];--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "voucher_codes" text[];