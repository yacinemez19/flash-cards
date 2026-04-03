import { pgTable, serial, integer, text, timestamp, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	username: text('username').notNull().unique(),
	created_at: timestamp('created_at').defaultNow()
});

export const decks = pgTable('decks', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	created_at: timestamp('created_at').defaultNow()
});

export const cards = pgTable('cards', {
	id: serial('id').primaryKey(),
	deck_id: integer('deck_id')
		.notNull()
		.references(() => decks.id, { onDelete: 'cascade' }),
	question: text('question').notNull(),
	answer: text('answer').notNull()
});

export const userStats = pgTable(
	'user_stats',
	{
		id: serial('id').primaryKey(),
		user_id: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		deck_id: integer('deck_id')
			.notNull()
			.references(() => decks.id, { onDelete: 'cascade' }),
		sessions: integer('sessions').notNull().default(0),
		best_score: integer('best_score').notNull().default(0),
		best_total: integer('best_total').notNull().default(0),
		last_played: timestamp('last_played')
	},
	(t) => [unique().on(t.user_id, t.deck_id)]
);
