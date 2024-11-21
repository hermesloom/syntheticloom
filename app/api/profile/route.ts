import { requestWithAuth } from "../_common/endpoints";

export const GET = requestWithAuth(async (supabase, user) => {
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error("Failed to fetch profile");
  }

  // Get user's projects
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("last_accessed_at", { ascending: false });

  if (projectsError) {
    throw new Error("Failed to fetch projects");
  }

  return {
    ...profile,
    projects: projects || [],
  };
});
