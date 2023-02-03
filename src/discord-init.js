import fs from "node:fs";
import { REST, Routes } from "discord.js";
import { parse } from "dotenv";
import { commands } from "./lib/commands";

const config = parse(fs.readFileSync(".env"));

process.on("unhandledRejection", (error) => {
	console.error("Unhandled promise rejection:", error);
});

const rest = new REST({ version: "10" }).setToken(config.DISCORD_BOT_TOKEN);

// rest.on("restDebug", console.log)
console.log(
	await rest.put(Routes.applicationCommands(config.VITE_DISCORD_APP_ID), {
		body: commands,
	}),
);
