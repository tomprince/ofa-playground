import type { PageServerLoad } from "./$types";
import { listOffers, listUsers } from "$lib/firestore.server";

export const load = (async () => {
	const [users, offers] = await Promise.all([listUsers(), listOffers()]);
	return {
		users,
		offers: offers.map((offer) => ({
			...offer,
			name: users.find((user) => user.id === offer.userID)?.name,
		})),
	};
}) satisfies PageServerLoad;
