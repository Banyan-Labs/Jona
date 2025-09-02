"use server";

import {getSupabaseAdmin} from "@/lib/supabaseAdmin";
import type { AdminResume } from "@/types/admin";
import { getAdminBaseURL } from "@/app/api/admin/base";

// ===================
// RESUMES MANAGEMENT
// ===================

export async function getAllResumes(): Promise<AdminResume[]> {
   const supabaseAdmin = await getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select(`
      *,
      users!resumes_user_id_fkey (
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching resumes:", error);
    throw error;
  }

  return (data || []).map((resume) => {
    const user = resume.users as { name?: string; email?: string };
    return {
      ...resume,
      file_url: resume.file_path || "",
      user_name: user?.name || "Unknown",
      user_email: user?.email || "Unknown",
      uploaded_date: resume.created_at,
      original_filename: resume.file_name || "Unknown",
      file_type: "application/pdf",
      skills: [],
      experience_years: 0,
      education: "",
      match_score: Math.floor(Math.random() * 100),
      applications_sent: 0,
      parsed_content: resume.raw_text,
    };
  });
}

export async function getResumes(
  page = 1,
  search = ""
): Promise<{
  resumes: AdminResume[];
  total: number;
  page: number;
  limit: number;
}> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
      ...(search && { search }),
    });

    const response = await fetch(`${getAdminBaseURL()}/resumes?${params}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    console.warn("API endpoint unavailable, falling back to direct DB queries");
  }

  const allResumes = await getAllResumes();

  const filtered = search
    ? allResumes.filter((resume) =>
        [resume.user_name, resume.user_email, resume.original_filename]
          .map((field) => field?.toLowerCase())
          .some((value) => value?.includes(search.toLowerCase()))
      )
    : allResumes;

  const limit = 20;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    resumes: paginated,
    total: filtered.length,
    page,
    limit,
  };
}

export async function getResumeById(id: string): Promise<AdminResume | null> {
   const supabaseAdmin = await getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select(`
      *,
      users!resumes_user_id_fkey (
        name,
        email
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Failed to fetch resume ${id}:`, error);
    return null;
  }

  const user = data?.users as { name?: string; email?: string };

  return {
    ...data,
    file_url: data.file_path || "",
    user_name: user?.name || "Unknown",
    user_email: user?.email || "Unknown",
    uploaded_date: data.created_at,
    original_filename: data.file_name || "Unknown",
    file_type: "application/pdf",
    skills: [],
    experience_years: 0,
    education: "",
    match_score: Math.floor(Math.random() * 100),
    applications_sent: 0,
    parsed_content: data.raw_text,
  };
}

export async function deleteResume(id: string): Promise<boolean | void> {
  try {
    const response = await fetch(`${getAdminBaseURL()}/resumes/${id}`, {
      method: "DELETE",
    });

    if (response.ok) return;
  } catch {
    console.warn("API endpoint unavailable, falling back to direct DB queries");
  }
   const supabaseAdmin = await getSupabaseAdmin();

  const { error } = await supabaseAdmin.from("resumes").delete().eq("id", id);

  if (error) {
    console.error("Error deleting resume:", error);
    throw error;
  }

  return true;
}