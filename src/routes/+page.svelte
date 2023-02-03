<script lang="ts">
	import type { PageData } from "./$types";
	export let data: PageData;
</script>

<svelte:head>
	<title>OFA Playground</title>
	<meta name="description" content="OFA Playground" />
</svelte:head>

<section>
	<h2>Users</h2>
	<ul>
		{#each data.users as user}
			<li>
				<div><a href="/user/{encodeURIComponent(user.id)}">Link</a></div>
				<div><b>Name:</b> {user.name}</div>
				<div><b>Discord UID:</b> {user.discordUID}</div>
			</li>
		{/each}
	</ul>
	<h2>Offers</h2>
	<ul>
		{#each data.offers as offer}
			<li>
				<div><b>Offer:</b> {offer.description}</div>
				<div><b>User:</b> <a href="/user/{encodeURIComponent(offer.userID)}">{offer.name}</a></div>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		flex: 0.6;
	}
	li {
		display: list-item flex;
		flex-direction: column;
		flex: 0.6;
	}
</style>
