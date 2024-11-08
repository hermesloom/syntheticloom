import { requestWithAuth } from "../_common/endpoints";

export const POST = requestWithAuth(async (supabase, user, request) => {
  const { content } = await request.json();

  if (!content) {
    throw new Error("No content provided");
  }

  const res = await supabase
    .from("source_files")
    .insert({
      user_id: user.id,
      content,
    })
    .select()
    .single();

  return { url: request.headers.get("origin") + "/run/" + res.data.id };
});
