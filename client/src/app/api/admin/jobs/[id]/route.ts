
// app/api/admin/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const updates = await request.json();

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
