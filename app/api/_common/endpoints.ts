import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";

export type RequestWithAuthHandler = (
  supabase: SupabaseClient,
  user: User,
  request: Request
) => Promise<any>;

export function requestWithAuth(handler: RequestWithAuthHandler) {
  return async (req: Request) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
