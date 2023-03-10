import * as postgrest from "@supabase/postgrest-js";
const { PostgrestClient } = postgrest; // See https://github.com/supabase/postgrest-js/issues/411
import type { Database } from "../../types/supabase";
import { SignJWT } from "jose";
import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import type { Cookies } from "@sveltejs/kit";

type User = { name: string; discord_uid: string | null };
type Offer = { description: string };

const fetchWithAuth = (supabaseKey: string, getAccessToken: () => string): typeof fetch => {
	return (input, init) => {
		const accessToken = getAccessToken();
		const headers = new Headers(init?.headers);
		headers.set("apikey", supabaseKey);
		headers.set("Authorization", `Bearer ${accessToken}`);
		return fetch(input, { ...init, headers });
	};
};

export const connectAdmin = () => {
	const supabaseKey = env.VITE_SUPABASE_TOKEN;
	const accessToken = env.VITE_SUPABASE_TOKEN;
	const rest = new PostgrestClient<Database>(`${env.VITE_SUPABASE_PROJECT_URL}/rest/v1`, {
		fetch: fetchWithAuth(supabaseKey, () => accessToken),
	});
	return new Client(rest);
};

export const connectToken = (accessToken: string) => {
	const supabaseKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY;
	const rest = new PostgrestClient<Database>(`${env.VITE_SUPABASE_PROJECT_URL}/rest/v1`, {
		fetch: fetchWithAuth(supabaseKey, () => accessToken),
	});
	return new Client(rest);
};
export const connectAnon = () => {
	return connectToken(publicEnv.PUBLIC_SUPABASE_ANON_KEY);
};

const JWT_SECRET = new TextEncoder().encode(env.VITE_SUPABASE_JWT_SECRET);
export const discordJWT = async (discord_uid: string) => {
	const alg = "HS256";

	return await new SignJWT({ role: "authenticated", discord_uid })
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setIssuer("discord-bot")
		.setAudience("authenticated")
		.setExpirationTime("10m")
		.sign(JWT_SECRET);
};

export const connectWithDiscordUID = async (discord_uid: string) => {
	return connectToken(await discordJWT(discord_uid));
};

export const connectSession = (cookies: Cookies) => {
	const accessToken = cookies.get("supabase_token");
	return accessToken ? connectToken(accessToken) : connectAnon();
};

class Client {
	constructor(private rest: PostgrestClient<Database>) { }

	async addUser(name: string, discord_uid: string): Promise<boolean> {
		const { error } = await this.rest.from("users").insert({ name, discord_uid });
		if (error?.code === "23505") {
			return false;
		}
		if (error) {
			console.log(error);
			throw error;
		}
		return true;
	}

	async getUserFromDiscord(discordId: string): Promise<{ id: string; name: string } | null> {
		const { data, error: error } = await this.rest
			.from("users")
			.select("id, name")
			.eq("discord_uid", discordId)
			.maybeSingle();
		if (error) {
			console.log(error);
			throw error;
		}
		return data;
	}

	async getUser(id: string): Promise<({ id: string } & User) | null> {
		const { data, error: error } = await this.rest
			.from("users")
			.select()
			.eq("id", id)
			.maybeSingle();
		if (error) {
			console.log(error);
			throw error;
		}
		return data;
	}

	async listUsers(): Promise<({ id: string } & User)[]> {
		const { data, error } = await this.rest.from("users").select("id, name, discord_uid");
		if (error) {
			console.log(error);
			throw error;
		}
		return data;
	}

	async createOffer(user_id: string, description: string): Promise<void> {
		const { error } = await this.rest.from("offers").insert({ user_id, description });
		if (error) {
			console.log(error);
			throw error;
		}
	}

	async listOffers(
		userID?: string,
	): Promise<({ id: string; user_id: string; name: string } & Offer)[]> {
		let query = this.rest.from("offers").select("*, user:users(name)");
		if (userID) {
			query = query.eq("user_id", userID);
		}
		const { data, error } = await query;
		if (error) {
			console.log(error);
			throw error;
		}
		return data.map((r) => ({
			id: r.id,
			user_id: r.user_id,
			description: r.description,
			name: r.user.name,
		}));
	}
}
