<script lang="ts">
	import type { PageData } from "./$types";
	export let data: PageData;
</script>

<svelte:head>
	<title>OFA Playground - {data.user.name}</title>
	<meta name="description" content="OFA Playground" />
</svelte:head>

<section>
	<div><b>Name:</b> {data.user.name}</div>
	<div><b>Discord UID:</b> {data.user.discordUID}</div>
	<hr />
	<h2>Offers</h2>
	<ul>
		{#each data.offers as offer}
			<li>{offer.description}</li>
		{/each}
	</ul>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		flex: 0.6;
	}
</style>
