/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

import { type DiscordToken, getBotToken, guildScheduledEvents, userGuilds } from "./discord.js";
import {
	getServiceToken,
	type GoogleToken,
	insertEvent,
	insertCalendarList,
	patchEvent,
} from "./google.js";

interface Secrets {
	DISCORD_BOT_TOKEN: string;
	GOOGLE_SERVICE_ACCOUNT: string;
}

interface LocalEnv extends Secrets {
	GUILD_ID: string;
	CALENDAR_ID: string;
}

interface KVEnv extends Secrets {
	GUILDS: KVNamespace;
}

export type Env = LocalEnv | KVEnv;

async function updateCalendar({
	discordToken,
	googleToken,
	guild_id,
	calendar_id,
}: {
	discordToken: DiscordToken;
	googleToken: GoogleToken;
	guild_id: string;
	calendar_id: string;
}) {
	const discordEvents = await guildScheduledEvents(discordToken, guild_id);

	await insertCalendarList(googleToken, calendar_id);

	for (const discordEvent of discordEvents) {
		const start = Date.parse(discordEvent.scheduled_start_time);
		const end = new Date(start + 60 * 60 * 1000);
		const event = {
			id: discordEvents[0].id,
			start: { dateTime: discordEvent.scheduled_start_time },
			end: { dateTime: end.toISOString() },
			summary: discordEvent.name,
			description: discordEvent.description,
		};
		try {
			console.log(await patchEvent(googleToken, calendar_id, event.id, event));
		} catch {
			console.log(await insertEvent(googleToken, calendar_id, event));
		}
	}
}

export default {
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
		console.log(`Hello World!`);
		const discordToken = getBotToken(env.DISCORD_BOT_TOKEN);

		// Generate a short lived access token from the service account key credentials
		const googleToken = await getServiceToken(
			JSON.parse(env.GOOGLE_SERVICE_ACCOUNT),
			["https://www.googleapis.com/auth/calendar"],
			(p) => ctx.waitUntil(p),
		);

		if ("GUILD_ID" in env) {
			await updateCalendar({
				discordToken,
				googleToken,
				guild_id: env.GUILD_ID,
				calendar_id: env.CALENDAR_ID,
			});
		} else {
			const guilds = await userGuilds(discordToken);
			for (const guild of guilds) {
				const calendar_id = await env.GUILDS.get(guild.id);
				if (!calendar_id) {
					console.log(`No calendar for ${guild.name} (${guild.id}).`);
					continue;
				}
				console.log(`Processing events for ${guild.name} (${guild.id}) to ${calendar_id}.`);
				await updateCalendar({ discordToken, googleToken, guild_id: guild.id, calendar_id });
			}
		}
	},
};
