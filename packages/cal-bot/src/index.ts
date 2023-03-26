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

import { getBotToken, guildScheduledEvents } from "./discord";
import { getServiceToken, patchEvent } from "./google";

export interface Env {
	GUILD_ID: string;
	CALENDAR_ID: string;

	// Secrets
	DISCORD_BOT_TOKEN: string;
	GOOGLE_SERVICE_ACCOUNT: string;
}

export default {
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
		console.log(`Hello World!`);
		const discordToken = getBotToken(env.DISCORD_BOT_TOKEN);
		const discordEvents = await guildScheduledEvents(discordToken, env.GUILD_ID);

		// Generate a short lived access token from the service account key credentials
		const accessToken = await getServiceToken(
			JSON.parse(env.GOOGLE_SERVICE_ACCOUNT),
			["https://www.googleapis.com/auth/calendar"],
			(p) => ctx.waitUntil(p),
		);
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
			console.log(await patchEvent(accessToken, env.CALENDAR_ID, event.id, event));
		}
	},
};
