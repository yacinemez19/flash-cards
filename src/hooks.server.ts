import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const userId = event.cookies.get('userId');
	const username = event.cookies.get('username');

	event.locals.userId = userId ? parseInt(userId) : null;
	event.locals.username = username ?? null;

	return resolve(event);
};
