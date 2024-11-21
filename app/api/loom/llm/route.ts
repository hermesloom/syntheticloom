import { s } from "ajv-ts";
import { requestWithAuth } from "../../_common/endpoints";
import { SyntheticLoom } from "../../_common/SyntheticLoom";

const LoomLLMRequest = s.object({
  prompt: s.string(),
});

export const POST = requestWithAuth<s.infer<typeof LoomLLMRequest>>(
  async (supabase, user, request, body) => {
    if (user.api_credits === 0) {
      throw new Error("Insufficient API credits");
    }

    const loom = new SyntheticLoom();
    const { response, cost } = await loom.ask(body.prompt);

    await supabase
      .from("profiles")
      .update({
        api_credits: Math.max(user.api_credits! - cost, 0),
      })
      .eq("id", user.id);

    return { response };
  },
  LoomLLMRequest
);
