<script lang="ts">
	import type { PageData } from "./$types";
	export let data: PageData;
	import { env } from "$env/dynamic/public";
	import type { RESTOAuth2AuthorizationQuery } from "discord-api-types/v10";

	const getLoginURL = () => {
		const params: Readonly<RESTOAuth2AuthorizationQuery> = {
			client_id: env.PUBLIC_DISCORD_CLIENT_ID,
			redirect_uri: "http://localhost:8080/login/discord",
			response_type: "code",
			scope: "identify",
			prompt: "none",
		};
		const url = new URL("https://discord.com/api/oauth2/authorize");
		url.search = new URLSearchParams(params).toString();
		return url;
	};
</script>

<svelte:head>
	<title>OFA Playground</title>
	<meta name="description" content="OFA Playground" />
</svelte:head>

<section>
	<a href={getLoginURL().toString()}>Login with Discord</a>
	<h2>Users</h2>
	<ul>
		{#each data.users as user}
			<li>
				<div><a href="/user/{encodeURIComponent(user.id)}">Link</a></div>
				<div><b>Name:</b> {user.name}</div>
				<div><b>Discord UID:</b> {user.discord_uid}</div>
			</li>
		{/each}
	</ul>
	<h2>Offers</h2>
	<ul>
		{#each data.offers as offer}
			<li>
				<div><b>Offer:</b> {offer.description}</div>
				{#if offer.user_id}
					<div>
						<b>User:</b> <a href="/user/{encodeURIComponent(offer.user_id)}">{offer.name}</a>
					</div>
				{:else}
					<div><b>User:</b> <i>missing</i></div>
				{/if}
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
