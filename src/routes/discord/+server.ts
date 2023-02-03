import { verifyKey } from "discord-interactions";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

import { addUser, createOffer, getUserFromDiscord } from "$lib/airtable.server";
import {
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
	type APIApplicationCommandInteractionDataStringOption,
	type APIInteraction,
} from "discord-api-types/v10";
import { channelMessage } from "$lib/discord";

const verifyRequest = async (request: Request) => {
	const body = await request.text();
	if (import.meta.env.MODE == "cloudflare" || request.headers.get("x-ngrok")) {
		const signature = request.headers.get("X-Signature-Ed25519");
		const timestamp = request.headers.get("X-Signature-Timestamp");
		if (signature == null || timestamp == null) {
			throw error(401, "Bad request signature");
		}
		const isValidRequest = verifyKey(body, signature, timestamp, env.VITE_DISCORD_PUBLIC_KEY);
		if (!isValidRequest) {
			throw error(401, "Bad request signature");
		}
	}
	return body;
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await verifyRequest(request);

	// Interaction type and data
	const interaction = JSON.parse(body) as APIInteraction;
	const { type } = interaction;

	if (type === InteractionType.Ping) {
		return json({ type: InteractionResponseType.Pong });
	}

	if (
		type === InteractionType.ApplicationCommand &&
		interaction.data.type == ApplicationCommandType.ChatInput
	) {
		const { data } = interaction;
		const discordUID = interaction.member?.user.id || interaction.user?.id;

		const user = discordUID && (await getUserFromDiscord(discordUID));

		switch (data.name) {
			case "ping": {
				return channelMessage("pong");
			}
			case "register": {
				if (user) {
					console.log("Already registered", user);
				}
				if (!discordUID) {
					return channelMessage("Not invoked by a user!?");
				}
				// User's object choice
				const userName = (data.options as [APIApplicationCommandInteractionDataStringOption])[0]
					.value;
				try {
					await addUser(userName, discordUID);
				} catch (e) {
					console.error(e);
					return channelMessage(`Failed to create record.`);
				}
				return channelMessage(`Registered as ${userName}.`);
			}
			case "offer": {
				if (!user) {
					return channelMessage(`Must register with the bot first.`);
				}
				const description = (data.options as [APIApplicationCommandInteractionDataStringOption])[0]
					.value;
				await createOffer(user.id, description);
				return channelMessage("Offer created.");
			}
		}
	}

	throw error(400, "Unknown interaction.");
};
