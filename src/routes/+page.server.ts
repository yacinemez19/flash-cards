import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.userId) throw redirect(302, '/home');

	const allUsers = await db.select().from(users).orderBy(users.username);
	return { users: allUsers };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString().trim();

		if (!username || username.length < 2) {
			return fail(400, { error: 'Le pseudo doit contenir au moins 2 caractères.' });
		}

		let user = await db.select().from(users).where(eq(users.username, username)).then(r => r[0]);

		if (!user) {
			const result = await db.insert(users).values({ username }).returning();
			user = result[0];
		}

		cookies.set('userId', String(user.id), { path: '/', maxAge: 60 * 60 * 24 * 365 });
		cookies.set('username', user.username, { path: '/', maxAge: 60 * 60 * 24 * 365 });

		throw redirect(302, '/home');
	},

	select: async ({ request, cookies }) => {
		const data = await request.formData();
		const userId = data.get('userId')?.toString();

		if (!userId) return fail(400, { error: 'Utilisateur invalide.' });

		const user = await db.select().from(users).where(eq(users.id, parseInt(userId))).then(r => r[0]);
		if (!user) return fail(400, { error: 'Utilisateur introuvable.' });

		cookies.set('userId', String(user.id), { path: '/', maxAge: 60 * 60 * 24 * 365 });
		cookies.set('username', user.username, { path: '/', maxAge: 60 * 60 * 24 * 365 });

		throw redirect(302, '/home');
	},

	logout: async ({ cookies }) => {
		cookies.delete('userId', { path: '/' });
		cookies.delete('username', { path: '/' });
		throw redirect(302, '/');
	}
};
