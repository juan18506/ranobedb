<script lang="ts">
	import Collapsible from '$lib/components/display/Collapsible.svelte';
	import { page } from '$app/stores';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Keyed from '../Keyed.svelte';

	$: filterInUse = Boolean($page.url.search.replace(/\?page=\d+/, ''));
</script>

<Keyed>
	<section>
		<Collapsible open={false}>
			<svelte:fragment slot="summary">
				<h2 class="text-lg font-bold">
					Filters{#if filterInUse}<Icon name="filterCheck" />{:else}<Icon name="filter" />{/if}
				</h2>
			</svelte:fragment>
			<svelte:fragment slot="details">
				<slot />
			</svelte:fragment>
		</Collapsible>
	</section>
</Keyed>
