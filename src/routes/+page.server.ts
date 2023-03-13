import type { PageServerLoad } from "./$types";
import { connectSession } from "$lib/supabase.server";
import { decodeJwt, type JWTPayload } from "jose";

export const load = (async ({ cookies }) => {
	const client = connectSession(cookies);
	const [users, offers] = await Promise.all([client.listUsers(), client.listOffers()]);
	const supabase_token = cookies.get("supabase_token");
	let decoded_token: JWTPayload | null = null;
	if (supabase_token) {
		decoded_token = decodeJwt(supabase_token);
	}
	return {
		users,
		offers,
		token: decoded_token,
	};
}) satisfies PageServerLoad;
