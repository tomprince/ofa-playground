import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { error, redirect } from "@sveltejs/kit";
import { discordJWT } from "$lib/supabase.server";

import {
	type RESTGetAPIOAuth2CurrentAuthorizationResult,
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

	const discordToken = await exchangeOAuthCode(code);

	const authInfo = await getUserInfo(discordToken);

	if (!authInfo.user) {
		throw error(401, "User not identified.");
	}

	cookies.set("supabase_token", await discordJWT(authInfo.user.id), { path: "/" });
	throw redirect(303, "/");
};

async function makeRequest<ResponseType>(route: string, init: RequestInit): Promise<ResponseType> {
	const response = await fetch(`${RouteBases.api}/${route}`, init);
	return response.json();
}

async function getUserInfo(
	discordToken: DiscordToken,
): Promise<RESTGetAPIOAuth2CurrentAuthorizationResult> {
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

async function exchangeOAuthCode(code: string): Promise<DiscordToken> {
	const response: RESTPostOAuth2AccessTokenResult = await makeRequest(
		Routes.oauth2TokenExchange(),
		{
			method: "POST",
			body: new URLSearchParams({
				client_id: publicEnv.PUBLIC_DISCORD_CLIENT_ID,
				client_secret: env.VITE_DISCORD_CLIENT_SECRET,
				grant_type: "authorization_code",
				code: code,
				redirect_uri: "http://localhost:8080/login/discord",
			}),
		},
	);
	return new DiscordToken(response);
}