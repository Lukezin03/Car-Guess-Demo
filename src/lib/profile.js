import { supabase } from "./supabase";

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createProfile({ id, display_name, username = null }) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        id,
        display_name,
        username,
      },
    ])
    .select()
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateProfile({ id, display_name, username = null }) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name,
      username,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}
