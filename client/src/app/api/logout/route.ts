import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

export async function POST() {
  const supabase = createServerActionClient({ cookies });
  await supabase.auth.signOut();
  return new Response("Signed out", { status: 200 });
}