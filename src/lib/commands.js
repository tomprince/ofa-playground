import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

/**
 * @type{Partial<import('discord.js').APIApplicationCommand>[]}
 */
export const commands = [
	{
		name: "ping",
		description: "Ping",
		type: ApplicationCommandType.ChatInput,
	},
	{
		name: "count",
		description: "Count",
		type: ApplicationCommandType.ChatInput,
	},
	{
		name: "register",
		description: "Register with the bot.",
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: "name",
				description: "Name to be referred to by",
				required: true,
			},
		],
	},
	{
		name: "offer",
		description: "Make an offer",
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: "description",
				description: "Description of the service being offered.",
				required: true,
			},
		],
	},
];
