import {
	boolean,
	index,
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
		excerpt: text("excerpt"),
		content: text("content").notNull(),
		cover_image_url: text("cover_image_url"),
		tags: text("tags").array(),
		published: boolean("published").default(false).notNull(),
		published_at: timestamp("published_at", { withTimezone: true }),
		// GitHub repository information
		github_repo_url: text("github_repo_url"),
		homepage_url: text("homepage_url"),
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
