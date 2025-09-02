'use server'

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export async function getUserProfileServer() {
  const cookieStore = cookies();

  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore, // ✅ Pass as a function
  });

  const { data: user } = await supabase.auth.getUser();
  return user;
}