import { supabase } from "@/app/lib/supabaseClient";
import { AuthUser } from "../types/application";
import {Resume} from '@/app/types/application';
export async function uploadResume(file: File, userId: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const path = `user_${userId}/${safeName}`;

  const { data, error } = await supabase.storage
    .from("resumes")
    .upload(path, file);

  if (error) {
    throw new Error("Upload failed: " + error.message);
  }

  return data.path;

}
export function getResumePublicUrl(userId: string, fileName: string) {
  const { data } = supabase.storage
    .from("resumes")
    .getPublicUrl(`user_${userId}/${fileName}`);

  return data.publicUrl;
}
export async function insertResumeMetadata(
  userId: string,
  file: File,
  filePath: string,
  resumeText: string
) {
  const sanitizedText = resumeText.replace(/\s+/g, " ").trim();

  const { error } = await supabase.from("resumes").insert({
    user_id: userId,
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    resume_type: "general",
    active: true,
    resume_text: sanitizedText, // ✅ store clean text here
  });

  if (error) {
    throw new Error("Insert failed: " + error.message);
  }

  return true;
}

export async function buildResumeObject(
  file: File,
  user: AuthUser,
  resumeText: string
): Promise<Resume> {
  const filePath = await uploadResume(file, user.id);
  const fileUrl = getResumePublicUrl(user.id, file.name);
  await insertResumeMetadata(user.id, file, filePath, resumeText);

  return {
    file_path(filePath: any, arg1: string): void {
      console.log("Custom file path handler", filePath, arg1);
    },
    resume_text: resumeText.replace(/\s+/g, " ").trim(),
    id: crypto.randomUUID(), // 🔧 Or use Supabase-generated UUID from insert result if needed
    name: "Resume Name", // You might want to pass this in as a param or extract from file
    user: user,
    file_name: file.name,
    file_url: fileUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_default: true
  };
}

export async function getDefaultResume(userId: string): Promise<Resume | null> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();

  if (error) {
    console.error("❌ Failed to fetch resume:", error.message);
    return null;
  }

  return data as Resume | null;
}

// export async function getDefaultResume(userId: string): Promise<Resume | null> {
//   const { data, error } = await supabase
//     .from("resumes")
//     .select("*")
//     .eq("user_id", userId)
//     .eq("is_default", true)
//     .maybeSingle(); // handles 0 or 1 rows gracefully

//   if (error) {
//     console.error("❌ Failed to fetch default resume:", error.message);
//     return null;
//   }

//   // Fallback to most recent resume if no default is found
//   if (!data) {
//     const { data: fallback, error: fallbackError } = await supabase
//       .from("resumes")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", { ascending: false })
//       .limit(1);

//     if (fallbackError) {
//       console.error("⚠️ Fallback failed:", fallbackError.message);
//       return null;
//     }

//     return fallback?.[0] ?? null;
//   }

//   return data as Resume;
// }
