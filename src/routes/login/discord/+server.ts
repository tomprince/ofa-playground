import type { RequestHandler } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { discordJWT } from "$lib/supabase.server";

import { exchangeOAuthCode, getUserInfo } from "$lib/server/discord";

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	if (!code) {
		throw error(500, "Code not received from discord.");
	}

	const redirect_uri = new URL(url);
	redirect_uri.search = "";
	const discordToken = await exchangeOAuthCode(code, redirect_uri);

	const userInfo = await getUserInfo(discordToken);

	cookies.set("supabase_token", await discordJWT(userInfo.id), { path: "/", maxAge: 3600 });
	throw redirect(303, "/");
};
