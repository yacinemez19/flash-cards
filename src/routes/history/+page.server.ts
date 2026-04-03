import { db } from '$lib/server/db';
import { userStats, decks } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.userId) throw redirect(302, '/');

	const stats = await db
		.select({
			deckName: decks.name,
			sessions: userStats.sessions,
			best_score: userStats.best_score,
			best_total: userStats.best_total,
			last_played: userStats.last_played
		})
		.from(userStats)
		.innerJoin(decks, eq(decks.id, userStats.deck_id))
		.where(eq(userStats.user_id, locals.userId))
		.orderBy(decks.name);

	const totalSessions = stats.reduce((sum, s) => sum + s.sessions, 0);
	const avgSuccess =
		stats.length > 0
			? Math.round(
					stats.reduce((sum, s) => sum + (s.best_total > 0 ? (s.best_score / s.best_total) * 100 : 0), 0) / stats.length
				)
			: 0;

	return { stats, totalSessions, avgSuccess };
};
