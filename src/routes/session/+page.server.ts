import { db } from '$lib/server/db';
import { cards, decks, userStats, users } from '$lib/server/db/schema';
import { eq, inArray, and, sql } from 'drizzle-orm';
import { computeXp } from '$lib/server/xp';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.userId) throw redirect(302, '/');

	const deckIds = url.searchParams.get('decks')?.split(',').map(Number).filter(Boolean);
	const count = parseInt(url.searchParams.get('count') ?? '10');
	const mode = url.searchParams.get('mode') ?? 'answer';
	const type = url.searchParams.get('type') ?? 'qcm';

	if (!deckIds || deckIds.length === 0) throw redirect(302, '/home');

	const allCards = await db
		.select({
			id: cards.id,
			deck_id: cards.deck_id,
			question: cards.question,
			answer: cards.answer
		})
		.from(cards)
		.where(inArray(cards.deck_id, deckIds));

	if (allCards.length === 0) throw redirect(302, '/home');

	// Shuffle and take 'count' cards
	const shuffled = allCards.sort(() => Math.random() - 0.5);
	const sessionCards = shuffled.slice(0, Math.min(count, shuffled.length));

	// Get all possible answers for QCM distractors
	const allAnswers = allCards.map((c) => (mode === 'answer' ? c.answer : c.question));
	const uniqueAnswers = [...new Set(allAnswers)];

	const deckNames = await db
		.select({ id: decks.id, name: decks.name })
		.from(decks)
		.where(inArray(decks.id, deckIds));

	return {
		sessionCards,
		allAnswers: uniqueAnswers,
		deckIds,
		deckNames,
		mode,
		type,
		totalCards: sessionCards.length
	};
};

export const actions: Actions = {
	saveResult: async ({ request, locals }) => {
		if (!locals.userId) return fail(401);

		const data = await request.formData();
		const score = parseInt(data.get('score')?.toString() ?? '0');
		const total = parseInt(data.get('total')?.toString() ?? '0');
		const deckIdsStr = data.get('deckIds')?.toString() ?? '';
		const deckIds = deckIdsStr.split(',').map(Number).filter(Boolean);

		let isNewRecord = false;

		for (const deckId of deckIds) {
			const existing = await db
				.select()
				.from(userStats)
				.where(and(eq(userStats.user_id, locals.userId), eq(userStats.deck_id, deckId)))
				.then((r) => r[0]);

			if (existing) {
				const newBest =
					score / total > existing.best_score / (existing.best_total || 1);

				if (newBest) isNewRecord = true;

				await db
					.update(userStats)
					.set({
						sessions: sql`${userStats.sessions} + 1`,
						best_score: newBest ? score : existing.best_score,
						best_total: newBest ? total : existing.best_total,
						last_played: new Date()
					})
					.where(eq(userStats.id, existing.id));
			} else {
				isNewRecord = true;
				await db.insert(userStats).values({
					user_id: locals.userId,
					deck_id: deckId,
					sessions: 1,
					best_score: score,
					best_total: total,
					last_played: new Date()
				});
			}
		}

		const xpEarned = computeXp(score, total);
		if (xpEarned > 0) {
			await db
				.update(users)
				.set({ total_xp: sql`${users.total_xp} + ${xpEarned}` })
				.where(eq(users.id, locals.userId));
		}

		return { saved: true, isNewRecord, xpEarned };
	}
};
