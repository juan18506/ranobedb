import { auth } from '$lib/server/lucia';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.validate();
	if (session) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const email = form.get('email')?.toString();
		const password = form.get('password')?.toString();
		if (!email || !password || password?.length > 255) {
			return fail(400, { email, password, error: true });
		}

		try {
			const user = await auth.authenticateUser('email', email, password);
			const session = await auth.createSession(user.userId);
			locals.setSession(session);
		} catch (e) {
			const error = e as Error;
			if (
				error.message === 'AUTH_INVALID_PROVIDER_ID' ||
				error.message === 'AUTH_INVALID_PASSWORD'
			) {
				return fail(400, {
					email,
					password,
					message: 'Invalid login credentials',
					error: true
				});
			}
			return fail(500, {
				email,
				password,
				message: 'An unknown error has occurred',
				error: true
			});
		}

		throw redirect(303, '/');
	}
};
