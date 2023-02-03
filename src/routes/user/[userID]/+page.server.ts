import type { PageServerLoad } from "./$types";
import { getUser, listOffers } from "$lib/airtable.server";

export const load = (async ({ params: { userID } }) => {
	const user = await getUser(userID);
	return {
		user,
		offers: await listOffers(user.name),
	};
}) satisfies PageServerLoad;
