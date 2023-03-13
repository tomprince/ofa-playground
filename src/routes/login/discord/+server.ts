import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { error, redirect } from "@sveltejs/kit";
import { discordJWT } from "$lib/supabase.server";

import {
	type RESTGetAPICurrentUserResult,
	type RESTPostOAuth2AccessTokenResult,
	Routes,
	RouteBases,
} from "discord-api-types/v10";

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	if (!code) {
		throw error(500, "Code not received from discord.");
	}

	const redirect_uri = new URL(url);
	redirect_uri.search = "";
	console.log(redirect_uri.toString());
	const discordToken = await exchangeOAuthCode(code, redirect_uri);

	const userInfo = await getUserInfo(discordToken);
	console.log(userInfo);

	cookies.set("supabase_token", await discordJWT(userInfo.id), { path: "/", maxAge: 3600 });
	throw redirect(303, "/");
};

async function makeRequest<ResponseType>(route: string, init: RequestInit): Promise<ResponseType> {
	console.log(init);
	const response = await fetch(`${RouteBases.api}/${route}`, init);
	if (!response.ok) {
		const json = await response.json();
		console.log(json);
		throw json;
	}
	return response.json();
}

async function getUserInfo(discordToken: DiscordToken): Promise<RESTGetAPICurrentUserResult> {
	return makeRequest(Routes.user(), {
		headers: discordToken.getHeaders(),
	});
}

class DiscordToken {
	constructor(private data: RESTPostOAuth2AccessTokenResult) {}

	getHeaders() {
		return {
			Authorization: `${this.data.token_type} ${this.data.access_token}`,
		};
	}
}

async function exchangeOAuthCode(code: string, redirect_uri: URL): Promise<DiscordToken> {
	const response: RESTPostOAuth2AccessTokenResult = await makeRequest(
		Routes.oauth2TokenExchange(),
		{
			method: "POST",
			body: new URLSearchParams({
				client_id: publicEnv.PUBLIC_DISCORD_CLIENT_ID,
				client_secret: env.VITE_DISCORD_CLIENT_SECRET,
				grant_type: "authorization_code",
				code: code,
				redirect_uri: redirect_uri.toString(),
			}),
		},
	);
	return new DiscordToken(response);
}
