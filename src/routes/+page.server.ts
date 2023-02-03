import type { PageServerLoad } from "./$types";
import { listOffers, listUsers } from "$lib/airtable.server";

export const load = (async () => {
	return {
		users: await listUsers(),
		offers: await listOffers(),
	};
}) satisfies PageServerLoad;
