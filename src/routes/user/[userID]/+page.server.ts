import type { PageServerLoad } from "./$types";
import { connectSession } from "$lib/supabase.server";
import { error } from "@sveltejs/kit";

export const load = (async ({ cookies, params: { userID } }) => {
	const client = connectSession(cookies);
	const [user, offers] = await Promise.all([client.getUser(userID), client.listOffers(userID)]);
	if (!user) {
		throw error(404, "No such user.");
	}
	return {
		user,
		offers,
	};
}) satisfies PageServerLoad;
