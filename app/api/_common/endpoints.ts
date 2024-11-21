import { s } from "ajv-ts";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export type User = {
  id: string;
  registered_at?: string;
  api_credits?: number;
  api_key?: string;
};

export type RequestWithAuthHandler<T = any> = (
  supabase: SupabaseClient,
  user: User,
  request: NextRequest,
  body: T
) => Promise<any>;

export function requestWithAuth<T = any>(
  handler: RequestWithAuthHandler<T>,
  schema?: s.Object
) {
  return async (req: NextRequest) => {
    const supabase = await createClient();
    const { data: getUserData } = await supabase.auth.getUser();

    let user: User | null = getUserData?.user
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
    } else {
      const userFull = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      Object.assign(user, userFull.data);
    }

    try {
      let body: T = {} as T;
      if (schema) {
        body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid request body: " + parsed.error },
            { status: 422 }
          );
        }
        body = <T>parsed.data;
      }

      const response = await handler(supabase, user, req, body);
      return NextResponse.json(response ?? {});
    } catch (error) {
      console.error("Error processing request:", error);
      return NextResponse.json(
        { error: "An error occurred while processing your request" },
        { status: 500 }
      );
    }
  };
}
