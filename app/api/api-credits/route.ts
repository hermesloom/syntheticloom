import { requestWithAuth } from "../_common/endpoints";

export const GET = requestWithAuth(async (supabase, user, request) => {
  // Fetch the user's profile from Supabase
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("api_credits")
    .eq("id", user?.id)
    .single();

  if (error) {
    throw new Error("User not found");
  }

  return { apiCredits: profile.api_credits };
});
