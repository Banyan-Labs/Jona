
// app/api/admin/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .order('inserted_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      jobs: data,
      total: count,
      page,
      limit
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json();
    
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
