import type { PageServerLoad } from "./$types";
import { listOffers, listUsers } from "$lib/supabase.server";

export const load = (async () => {
	const [users, offers] = await Promise.all([listUsers(), listOffers()]);
	return {
		users,
		offers,
	};
}) satisfies PageServerLoad;
