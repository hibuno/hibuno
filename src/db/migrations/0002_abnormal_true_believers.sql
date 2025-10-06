DROP TABLE "post_analytics" CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "github_repo_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "github_stars" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "github_forks" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "github_homepage_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "github_pricing_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "github_license" text;