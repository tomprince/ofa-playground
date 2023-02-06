import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase'

import { env } from "$env/dynamic/private";

type User = { name: string; discord_uid: string | null };
type Offer = { description: string };

const supabase = createClient<Database>(
  env.VITE_SUPABASE_PROJECT_URL,
  env.VITE_SUPABASE_TOKEN,
)
console.log(await (await fetch(`${env.VITE_SUPABASE_PROJECT_URL}/pg/tables/`, {headers: {
  Authorization:`Bearer ${env.VITE_SUPABASE_TOKEN}`, apikey:`${env.VITE_SUPABASE_TOKEN}`}})).json())

export const addUser = async (name: string, discord_uid: string) => {
  const { error } = await supabase.from("users").insert({ name, discord_uid });
  if (error?.code === "23505") {
    return false;
  }
  if (error) {
    console.log(error)
    throw error;
  }
  return true;
}

export const getUserFromDiscord = async (
  discordId: string,
): Promise<{ id: string; name: string } | null> => {
  const { data, error: error } = await supabase.from("users").select("id, name").eq("discord_uid", discordId).maybeSingle();
  if (error) {
    console.log(error)
    throw error;
  }
  return data;
}

export const getUser = async (id: string): Promise<({ id: string } & User) | null> => {
  const { data, error: error } = await supabase.from("users").select().eq("id", id).maybeSingle();
  if (error) {
    console.log(error)
    throw error;
  }
  return data;
}

export const listUsers = async (): Promise<({ id: string } & User)[]> => {
  const { data, error } = await supabase.from("users").select("id, name, discord_uid");
  if (error) {
    console.log(error)
    throw error;
  }
  return data;
}

export const createOffer = async (user_id: string, description: string) => {
  const { error } = await supabase.from("offers").insert({ user_id, description });
  if (error) {
    console.log(error)
    throw error;
  }
}

export const listOffers = async (
  userID?: string,
): Promise<({ id: string; user_id: string, name: string } & Offer)[]> => {
  let query = supabase.from("offers").select("*, user:users(name)");
  if (userID) {
    query = query.eq("user_id", userID);
  }
  const { data, error } = await query;
  if (error) {
    console.log(error)
    throw error;
  }
  return data.map(r =>({id:r.id, user_id: r.user_id, description:r.description, name:r.user.name}));
}
