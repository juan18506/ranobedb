<script lang="ts">
	import { buildImageUrl } from '$lib/components/book/book';
	import Revision from '$lib/components/history/Revision.svelte';
	import RevisionContainer from '$lib/components/history/RevisionContainer.svelte';
	import MetaTags from '$lib/components/layout/MetaTags.svelte';
	import NoIndex from '$lib/components/layout/NoIndex.svelte';
	import PageTitle from '$lib/components/layout/PageTitle.svelte';
	import Series from '$lib/components/series/id/Series.svelte';
	import { getDisplayPrefsContext, getTitleDisplay } from '$lib/display/prefs.js';

	export let data;

	const displayPrefs = getDisplayPrefsContext();
	$: series = data.series;
	$: title = getTitleDisplay({ obj: series, prefs: $displayPrefs.title_prefs });
	$: firstBookInSeries = series.books.at(0);
	$: imageUrl = buildImageUrl(firstBookInSeries?.image?.filename);

	function buildBaseLink() {
		return `/series/${data.seriesId}`;
	}
</script>

<PageTitle title="Viewing revision {data.revision.revision} of {title}" />
<MetaTags {title} image={imageUrl} description={series.description} site_name={'RanobeDB'} />
<NoIndex />

<main class="container-rndb flex flex-col gap-6">
	<RevisionContainer>
		<svelte:fragment slot="revision">
			<Revision
				diffs={data.diffs}
				changes={data.changes}
				{title}
				{buildBaseLink}
				currentItemVisibility={data.currentItemVisibility}
			/>
		</svelte:fragment>

		<svelte:fragment slot="content">
			<Series
				series={{ ...series, id: data.seriesId }}
				user={data.user}
				revision={data.revision.revision}
			/>
		</svelte:fragment>
	</RevisionContainer>
</main>
