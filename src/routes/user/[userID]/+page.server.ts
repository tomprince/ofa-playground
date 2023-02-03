import type { PageServerLoad } from "./$types";
import { getUser, listOffers } from "$lib/firestore.server";
import { error } from "@sveltejs/kit";

export const load = (async ({ params: { userID } }) => {
	const user = await getUser(userID);
	if (!user) {
		throw error(404, "No such user.");
	}
	return {
		user,
		offers: await listOffers(userID),
	};
}) satisfies PageServerLoad;
