import { requestWithAuth } from "../_common/endpoints";

function generateApiKey(): string {
  const prefix = "loom_secret_";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";

  for (let i = 0; i < 64; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return prefix + key;
}

export const GET = requestWithAuth(async (supabase, user, request) => {
  // Fetch the user's profile from Supabase
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("api_key")
    .eq("id", user?.id)
    .single();

  if (error) {
    throw new Error("User not found");
  }

  const generateNew =
    request.nextUrl.searchParams.get("generate_new") === "true";

  let apiKey = profile.api_key;
  if (!apiKey || generateNew) {
    apiKey = generateApiKey();
    await supabase
      .from("profiles")
      .update({ api_key: apiKey })
      .eq("id", user?.id);
  }

  return { apiKey };
});
