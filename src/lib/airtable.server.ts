import Airtable, { type FieldSet } from "airtable";
import { env } from "$env/dynamic/private";
import type { QueryParams } from "airtable/lib/query_params";
import { building } from "$app/environment";

const base = !building
	? new Airtable({ apiKey: env.VITE_AIRTABLE_TOKEN }).base(env.VITE_AIRTABLE_BASE)
	: // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	  null!;

export const addUser = async (name: string, discordId: string) => {
	// @ts-expect-error Bad types in upstream library.
	base("users").update(
		[
			{
				fields: { name: name, discordUID: discordId },
			},
		],
		{ performUpsert: { fieldsToMergeOn: ["discordUID"] } },
	);
};

const airtableEscapeString = (val: string) => {
	return '"' + val.replaceAll("\\", "\\\\").replaceAll('"', '\\"') + '"';
};

export const getUserFromDiscord = async (
	discordId: string,
): Promise<{ id: string; name: string } | null> => {
	const result = await base("users")
		.select({
			fields: ["name"],
			maxRecords: 1,
			filterByFormula: `{discordUID} = ${airtableEscapeString(discordId)}`,
		})
		.firstPage();
	if (result.length > 0) {
		return { id: result[0].id, ...result[0].fields } as { id: string; name: string };
	} else {
		return null;
	}
};

export const getUser = async (userID: string) => {
	const r = await base("users").find(userID);
	return {
		id: r.id,
		name: r.fields.name as string,
		discordUID: r.fields.discordUID as string,
	};
};

export const listUsers = async () => {
	const result = await base("users")
		.select({
			fields: ["name", "discordUID", "offerDescriptions"],
		})
		.firstPage();
	return result.map((r) => ({
		id: r.id,
		name: r.fields.name as string,
		discordUID: r.fields.discordUID as string,
	}));
};

export const createOffer = async (userID: string, description: string) => {
	await base("offers").create({ description, user: [userID] });
};

export const listOffers = async (userID?: string) => {
	const options: QueryParams<FieldSet> = {};
	if (userID) {
		options.filterByFormula = `{user} = ${airtableEscapeString(userID)}`;
		console.log(options);
	}
	const result = await base("offers")
		.select({
			...options,
		})
		.firstPage();
	return result.map((r) => ({
		id: r.id,
		description: r.fields.description as string,
		name: r.fields.name as string,
		userID: (r.fields.user as string[])[0],
	}));
};
