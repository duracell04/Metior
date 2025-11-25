import { NextResponse } from "next/server";

import { getMeoSnapshot } from "@/lib/meo-data";

export const revalidate = 3600; // cache API response for 1 hour

export async function GET() {
  try {
    const snapshot = await getMeoSnapshot();
    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    console.error("weights error", error);
    return NextResponse.json({ error: "failed to build MEΩ snapshot" }, { status: 502 });
  }
}
