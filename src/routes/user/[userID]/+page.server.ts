import type { PageServerLoad } from "./$types";
import { getUser, listOffers } from "$lib/firestore.server";
import { error } from "@sveltejs/kit";

export const load = (async ({ params: { userID } }) => {
	const [user, offers] = await Promise.all([getUser(userID), listOffers(userID)]);
	if (!user) {
		throw error(404, "No such user.");
	}
	return {
		user,
		offers,
	};
}) satisfies PageServerLoad;
