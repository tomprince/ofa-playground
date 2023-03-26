import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";

import {
	type RESTGetAPICurrentUserResult,
	type RESTPostOAuth2AccessTokenResult,
	Routes,
	RouteBases,
} from "discord-api-types/v10";

export async function makeRequest<ResponseType>(
	route: string,
	init: RequestInit,
): Promise<ResponseType> {
	const response = await fetch(`${RouteBases.api}/${route}`, init);
	if (!response.ok) {
		const json = await response.json();
		console.log(json);
		throw json;
	}
	return response.json();
}

export async function getUserInfo(
	discordToken: DiscordToken,
): Promise<RESTGetAPICurrentUserResult> {
	return makeRequest(Routes.user(), {
		headers: discordToken.getHeaders(),
	});
}

interface TokenInfo {
	access_token: string;
	token_type: string;
}

class DiscordToken {
	constructor(private data: TokenInfo) {}

	getHeaders() {
		return {
			Authorization: `${this.data.token_type} ${this.data.access_token}`,
		};
	}
}

export async function exchangeOAuthCode(code: string, redirect_uri: URL): Promise<DiscordToken> {
	// Note that we can't pass URLSearchParams here directly, as
	// it doesn't appear to work in cloudflare workers.
	const response: RESTPostOAuth2AccessTokenResult = await makeRequest(
		Routes.oauth2TokenExchange(),
		{
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: publicEnv.PUBLIC_DISCORD_CLIENT_ID,
				client_secret: env.VITE_DISCORD_CLIENT_SECRET,
				grant_type: "authorization_code",
				code: code,
				redirect_uri: redirect_uri.toString(),
			}).toString(),
		},
	);
	return new DiscordToken(response);
}
