import { json } from "@sveltejs/kit";
import { InteractionResponseType, type APIInteractionResponse } from "discord.js";

export const channelMessage = (message: string): Response => {
	return json({
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: message,
		},
	} as APIInteractionResponse);
};
