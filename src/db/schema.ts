import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

// Posts table with optimized schema for blog functionality
export const posts = pgTable(
	"posts",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		slug: text("slug").notNull(),
		title: text("title").notNull(),
		subtitle: text("subtitle"),
		excerpt: text("excerpt"),
		content: text("content").notNull(),
		coverImageUrl: text("cover_image_url"),
		coverImageAlt: text("cover_image_alt"),
		authorName: text("author_name").notNull(),
		authorAvatarUrl: text("author_avatar_url"),
		authorBio: text("author_bio"),
		tags: text("tags").array(),
		category: text("category"),
		readingTime: integer("reading_time"),
		wordCount: integer("word_count"),
		featured: boolean("featured").default(false).notNull(),
		published: boolean("published").default(false).notNull(),
		published_at: timestamp("published_at", { withTimezone: true }),
		// GitHub repository information
		githubRepoUrl: text("github_repo_url"),
		githubStars: integer("github_stars"),
		githubForks: integer("github_forks"),
		githubHomepageUrl: text("github_homepage_url"),
		githubPricingUrl: text("github_pricing_url"),
		githubLicense: text("github_license"),
		// Pricing information
		minPrice: integer("min_price"),
		maxPrice: integer("max_price"),
		offerFree: boolean("offer_free").default(false).notNull(),
		prevMinPrice: integer("prev_min_price"),
		prevMaxPrice: integer("prev_max_price"),
		inPromotion: boolean("in_promotion").default(false).notNull(),
		// Social media and vouchers
		socialMedias: text("social_medias").array(),
		voucherCodes: text("voucher_codes").array(),
		created_at: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => ({
		// Indexes for better query performance
		slugIdx: uniqueIndex("posts_slug_idx").on(table.slug),
		publishedIdx: index("posts_published_idx").on(table.published),
		published_atIdx: index("posts_published_at_idx").on(table.published_at),
		featuredIdx: index("posts_featured_idx").on(table.featured),
		categoryIdx: index("posts_category_idx").on(table.category),
		tagsIdx: index("posts_tags_idx").on(table.tags),
		// Compound index for published posts ordered by date
		publishedDateIdx: index("posts_published_date_idx").on(
			table.published,
			table.published_at,
		),
	}),
);

// Newsletter subscribers with improved tracking
export const newsletter = pgTable(
	"newsletter",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		email: text("email").notNull(),
		emailLower: text("email_lower"),
		source: text("source"),
		subscribed_at: timestamp("subscribed_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		confirmed_at: timestamp("confirmed_at", { withTimezone: true }),
		unsubscribed_at: timestamp("unsubscribed_at", { withTimezone: true }),
		isActive: boolean("is_active").default(true).notNull(),
		created_at: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		emailLowerUdx: uniqueIndex("newsletter_email_lower_uidx").on(t.emailLower),
		emailIdx: index("newsletter_email_idx").on(t.email),
		activeIdx: index("newsletter_active_idx").on(t.isActive),
	}),
);

// GitHub repository information for posts related to projects

// Type definitions
export type InsertPost = typeof posts.$inferInsert;
export type SelectPost = typeof posts.$inferSelect;

export type InsertNewsletter = typeof newsletter.$inferInsert;
export type SelectNewsletter = typeof newsletter.$inferSelect;

