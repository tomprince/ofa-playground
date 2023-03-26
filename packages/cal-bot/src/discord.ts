import { Routes, RouteBases, RESTGetAPIGuildScheduledEventsResult } from "discord-api-types/v10";

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

export function getBotToken(access_token: string) {
	return new DiscordToken({
		token_type: "Bot",
		access_token,
	});
}

export async function guildScheduledEvents(
	discordToken: DiscordToken,
	guildId: string,
): Promise<RESTGetAPIGuildScheduledEventsResult> {
	return makeRequest(Routes.guildScheduledEvents(guildId), {
		headers: discordToken.getHeaders(),
	});
}
