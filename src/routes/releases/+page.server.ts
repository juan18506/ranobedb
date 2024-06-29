import { db } from '$lib/server/db/db.js';
import { orderNullsLast, paginationBuilderExecuteWithCount } from '$lib/server/db/dbHelpers.js';
import { DBReleases } from '$lib/server/db/releases/releases.js';
import { pageSchema, qSchema, releaseFiltersSchema } from '$lib/server/zod/schema.js';
import { DeduplicateJoinsPlugin, type Expression, type SqlBool } from 'kysely';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ url, locals }) => {
	const page = await superValidate(url, zod(pageSchema));
	const qS = await superValidate(url, zod(qSchema));

	const currentPage = page.data.page;
	const q = qS.data.q;

	const form = await superValidate(url, zod(releaseFiltersSchema));

	const dbReleases = DBReleases.fromDB(db, locals.user);

	let query = dbReleases.getReleases().where('release.hidden', '=', false);

	const sort = form.data.sort;
	if (sort === 'Title asc') {
		query = query.orderBy((eb) => eb.fn.coalesce('release.romaji', 'release.title'), 'asc');
	} else if (sort === 'Title desc') {
		query = query.orderBy((eb) => eb.fn.coalesce('release.romaji', 'release.title'), 'desc');
	} else if (sort === 'Release date asc') {
		query = query.orderBy('release.release_date asc');
	} else if (sort === 'Release date desc') {
		query = query.orderBy('release.release_date desc');
	} else if (sort === 'Pages asc') {
		query = query.orderBy('release.pages', 'asc');
	} else if (sort === 'Pages desc') {
		query = query.orderBy('release.pages', orderNullsLast('desc'));
	}

	if (sort !== 'Title asc' && sort !== 'Title desc') {
		query = query.orderBy((eb) => eb.fn.coalesce('release.romaji', 'release.title'), 'asc');
	}

	const useQuery = Boolean(q);
	const useReleaseLangFilters = form.data.rl.length > 0;
	const useReleaseFormatFilters = form.data.rf.length > 0;

	if (useQuery || useReleaseLangFilters || useReleaseFormatFilters) {
		query = query.withPlugin(new DeduplicateJoinsPlugin());
		if (useQuery) {
			query = query.where((eb) =>
				eb.or([eb('release.romaji', 'ilike', `%${q}%`), eb('release.title', 'ilike', `%${q}%`)]),
			);
		}
		if (useReleaseLangFilters) {
			query = query.where((eb) => {
				const filters: Expression<SqlBool>[] = [];
				for (const lang of form.data.rl) {
					filters.push(eb('release.lang', '=', lang));
				}
				return eb.or(filters);
			});
		}
		if (useReleaseFormatFilters) {
			query = query.where((eb) => {
				const filters: Expression<SqlBool>[] = [];
				for (const format of form.data.rf) {
					filters.push(eb('release.format', '=', format));
				}
				return eb.or(filters);
			});
		}
	}

	const {
		result: releases,
		count,
		totalPages,
	} = await paginationBuilderExecuteWithCount(query, {
		limit: 24,
		page: currentPage,
	});

	return {
		releases,
		count,
		currentPage,
		totalPages,
		filtersForm: form,
	};
};
