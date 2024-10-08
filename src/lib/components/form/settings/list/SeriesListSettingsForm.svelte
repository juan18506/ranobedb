<script lang="ts">
	import { addToast } from '$lib/components/toast/Toaster.svelte';
	import type { userListSeriesSettingsSchema } from '$lib/server/zod/schema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SelectField from '../../SelectField.svelte';
	import SubmitButton from '../../SubmitButton.svelte';
	import Keyed from '../../Keyed.svelte';
	import {
		defaultUserListLabelsArray,
		languageNames,
		languagesArray,
		releaseFormatArray,
	} from '$lib/db/dbConsts';
	import MultiSelectField from '../../MultiSelectField.svelte';
	import CheckboxField from '../../CheckboxField.svelte';

	export let userListSeriesSettingsForm: SuperValidated<Infer<typeof userListSeriesSettingsSchema>>;

	const readingStatuses = defaultUserListLabelsArray.map((v) => {
		return { display: v, value: v };
	});

	const sForm = superForm(userListSeriesSettingsForm, { dataType: 'json', invalidateAll: 'force' });
	const { form, enhance, delayed, submitting, message } = sForm;

	$: if (!$delayed && $message) {
		addToast({ data: { title: $message.text, type: $message.type } });
	}
</script>

<form method="post" action="?/serieslistsettings" class="flex flex-col gap-4" use:enhance>
	<div class="flex flex-col gap-2">
		<div>
			<h3 class="font-bold text-lg">Default series list preferences</h3>
			<p class="text-sm">
				Used when automatically adding a series to your list or as the default when adding a series
				to your list manually.
			</p>
		</div>

		<div class="flex flex-wrap gap-x-4 gap-y-2">
			<SelectField
				form={sForm}
				field="readingStatus"
				label="Default reading status"
				dropdownOptions={readingStatuses}
				showRequiredSymbolIfRequired={false}
				selectedValue={$form.readingStatus}
				resetPadding={true}
				fit={true}
			/>
		</div>

		<div>
			<CheckboxField form={sForm} field="show_upcoming" label="Show upcoming releases" />

			{#if $form.show_upcoming}
				<p>Show upcoming releases when:</p>
				<div class="flex flex-wrap gap-x-2">
					<div class="max-w-fit">
						<Keyed>
							<MultiSelectField
								form={sForm}
								field="langs"
								noneSelectedText="any"
								allSelectedText="any"
								labelText="Release language is one of"
								dropdownOptions={languagesArray.map((v) => ({
									display: languageNames[v],
									value: v,
								}))}
							/>
						</Keyed>
					</div>
					<div class="max-w-fit">
						<Keyed>
							<MultiSelectField
								form={sForm}
								field="formats"
								noneSelectedText="any"
								allSelectedText="any"
								labelText="Release format is one of"
								dropdownOptions={releaseFormatArray.map((v) => ({
									display: v,
									value: v,
								}))}
							/>
						</Keyed>
					</div>
				</div>
			{/if}
		</div>
	</div>
	<SubmitButton delayed={$delayed} submitting={$submitting} text={'Save preferences'} />
</form>
