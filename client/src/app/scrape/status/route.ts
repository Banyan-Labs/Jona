
// app/api/scrape/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const logId = searchParams.get('logId');

  if (!logId) {
    return NextResponse.json({ error: "Log ID is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('scraping_logs')
      .select('*')
      .eq('id', logId)
      .single();

    if (error) {
      return NextResponse.json({ error: "Scraping log not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching scraping status:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}