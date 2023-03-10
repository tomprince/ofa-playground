import type { PageServerLoad } from "./$types";
import { connectSession } from "$lib/supabase.server";

export const load = (async ({ cookies }) => {
	const client = connectSession(cookies);
	const [users, offers] = await Promise.all([client.listUsers(), client.listOffers()]);
	return {
		users,
		offers,
	};
}) satisfies PageServerLoad;
