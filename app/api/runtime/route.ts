import { snapshot } from "@webcontainer/snapshot";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const folderSnapshot = await snapshot(path.join(process.cwd(), "runtime"));

  return new NextResponse(folderSnapshot, {
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });
}
