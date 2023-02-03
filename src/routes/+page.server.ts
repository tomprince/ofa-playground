import type { PageServerLoad } from "./$types";
import { listOffers, listUsers } from "$lib/firestore.server";

export const load = (async () => {
	const users = await listUsers();
	const offers = (await listOffers()).map((offer) => ({
		...offer,
		name: users.find((user) => user.id === offer.userID)?.name,
	}));
	return {
		users,
		offers,
	};
}) satisfies PageServerLoad;
