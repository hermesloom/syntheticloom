import { s } from "ajv-ts";
import { requestWithAuth } from "../../_common/endpoints";

const ProjectNameRequest = s.object({
  name: s.string(),
});

export const PATCH = requestWithAuth(
  async (supabase, user, request, { name }) => {
    const projectId = request.nextUrl.pathname.split("/").pop();

    const { data, error } = await supabase
      .from("projects")
      .update({ name })
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      throw new Error("Failed to update project");
    }

    return data;
  },
  ProjectNameRequest
);

export const DELETE = requestWithAuth(async (supabase, user, request) => {
  const projectId = request.nextUrl.pathname.split("/").pop();

  const { error: sourceFilesError } = await supabase
    .from("source_files")
    .delete()
    .eq("project_id", projectId);

  if (sourceFilesError) {
    throw new Error("Failed to delete source files");
  }

  const { error: projectError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (projectError) {
    throw new Error("Failed to delete project");
  }
});
