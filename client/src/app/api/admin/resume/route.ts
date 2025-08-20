
// app/api/admin/resumes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    
    let query = supabase
      .from('resumes')
      .select(`
        *,
        users!resumes_user_id_fkey (
          name,
          email
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`file_name.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      resumes: data,
      total: count,
      page,
      limit
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}