import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Get the ID from the URL
  const id = request.url.split("/").pop();

  if (!id) {
    throw new Error("No ID provided");
  }

  // Get the source file and join with profiles to get the API key
  const { data, error } = await supabase
    .from("source_files")
    .select(
      `
      content,
      profiles!inner (
        api_key
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("Source file not found");
  }

  return NextResponse.json({
    content: data.content,
    apiKey: (data.profiles as any).api_key,
  });
}
