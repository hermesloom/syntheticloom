import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export type RequestWithAuthHandler = (
  supabase: SupabaseClient,
  user: { id: string },
  request: NextRequest
) => Promise<any>;

export function requestWithAuth(handler: RequestWithAuthHandler) {
  return async (req: NextRequest) => {
    const supabase = await createClient();
    const { data: getUserData } = await supabase.auth.getUser();

    let user: { id: string } | null = getUserData?.user
      ? { id: getUserData.user.id }
      : null;

    if (!user) {
      const apiKey = req.headers.get("authorization");
      if (!apiKey || !apiKey.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const key = apiKey.split(" ")[1];
      const userWithKey = await supabase
        .from("profiles")
        .select("*")
        .eq("api_key", key)
        .single();

      if (userWithKey.error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      user = { id: userWithKey.data.id };
    }

    try {
      const response = await handler(supabase, user, req);
      return NextResponse.json(response);
    } catch (error) {
      console.error("Error processing request:", error);
      return NextResponse.json(
        { error: "An error occurred while processing your request" },
        { status: 500 }
      );
    }
  };
}
