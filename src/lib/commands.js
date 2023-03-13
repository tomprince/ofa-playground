import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

/**
 * @type{Partial<import('discord-api-types/v10').APIApplicationCommand>[]}
 */
export const commands = [
	{
		name: "ping",
		description: "Ping",
		type: ApplicationCommandType.ChatInput,
	},
	{
		name: "whoami",
		description: "Report who the bot thinks you are.",
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
