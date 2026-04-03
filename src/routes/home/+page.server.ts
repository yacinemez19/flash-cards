import { db } from '$lib/server/db';
import { decks, cards, users } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';
import { xpProgress } from '$lib/server/xp';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.userId) throw redirect(302, '/');

	const allDecks = await db
		.select({
			id: decks.id,
			name: decks.name,
			description: decks.description,
			created_at: decks.created_at,
			cardCount: sql<number>`count(${cards.id})`.as('card_count')
		})
		.from(decks)
		.leftJoin(cards, eq(cards.deck_id, decks.id))
		.groupBy(decks.id)
		.orderBy(decks.name);

	const userRow = await db
		.select({ total_xp: users.total_xp })
		.from(users)
		.where(eq(users.id, locals.userId))
		.then((r) => r[0]);

	const { level, xpIntoLevel, xpNeeded, progressPct } = xpProgress(userRow?.total_xp ?? 0);

	return {
		decks: allDecks,
		xp: { total: userRow?.total_xp ?? 0, level, xpIntoLevel, xpNeeded, progressPct }
	};
};

interface ImportJson {
	name?: string;
	description?: string;
	cards?: { question?: string; answer?: string }[];
}

export const actions: Actions = {
	import: async ({ request }) => {
		const data = await request.formData();
		const file = data.get('file') as File | null;

		if (!file || file.size === 0) {
			return fail(400, { error: 'Veuillez sélectionner un fichier JSON.' });
		}

		let json: ImportJson;
		try {
			const text = await file.text();
			json = JSON.parse(text);
		} catch {
			return fail(400, { error: 'Le fichier n\'est pas un JSON valide.' });
		}

		if (!json.name || typeof json.name !== 'string') {
			return fail(400, { error: 'Le champ "name" est requis.' });
		}

		if (!Array.isArray(json.cards)) {
			return fail(400, { error: 'Le champ "cards" doit être un tableau.' });
		}

		if (json.cards.length < 4) {
			return fail(400, { error: 'Le jeu doit contenir au minimum 4 cartes.' });
		}

		for (let i = 0; i < json.cards.length; i++) {
			const card = json.cards[i];
			if (!card.question || !card.answer) {
				return fail(400, { error: `La carte ${i + 1} doit avoir "question" et "answer".` });
			}
		}

		const [deck] = await db
			.insert(decks)
			.values({ name: json.name, description: json.description ?? null })
			.returning();

		await db.insert(cards).values(
			json.cards.map((c) => ({
				deck_id: deck.id,
				question: c.question!,
				answer: c.answer!
			}))
		);

		return { success: true, deckName: deck.name };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const deckId = data.get('deckId')?.toString();

		if (!deckId) return fail(400, { error: 'ID du jeu manquant.' });

		await db.delete(decks).where(eq(decks.id, parseInt(deckId)));
		return { deleted: true };
	}
};
