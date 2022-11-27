/// <reference types="lucia-auth" />
declare namespace Lucia {
	type Auth = import('$lib/server/lucia.js').Auth;
	type UserAttributes = {
		username: string;
	};
}

/// <reference types="@sveltejs/kit" />
declare namespace App {
	interface Locals {
		getSession: import('@lucia-auth/sveltekit').GetSession;
		setSession: import('@lucia-auth/sveltekit').SetSession;
		getSessionUser: import('@lucia-auth/sveltekit').GetSessionUser;
	}
}

declare namespace svelte.JSX {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface HTMLAttributes<T> {
		onoutclick?: () => void;
	}
}
