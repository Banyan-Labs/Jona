'use server'

import { NextResponse } from 'next/server';
import {getSupabaseAdmin} from '@/lib/supabaseAdmin';
import { NextRequest } from 'next/server';
import { toAuthUser,AuthUser } from '@/types';
import { Database } from '@/types/database';
import { cookies } from 'next/headers';
// import {import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
export async function validateAdminAuth(request: NextRequest): Promise<AuthUser | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const supabase = await getSupabaseAdmin(); // ✅ instantiate the client
  const { data: { user }, error } = await supabase.auth.getUser(token); // ✅ now valid

  if (error || !user) return null;

  const role = user.user_metadata?.role || user.app_metadata?.role;
  if (role !== 'admin') return null;

  return toAuthUser(user);
}

export async function createAuthResponse(
   message: string,
  status: number
): Promise<NextResponse> {
  const supabase = createServerComponentClient<Database>({ cookies });

  // Refresh session if needed
  await supabase.auth.getUser();

  // Return custom error response
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}


export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  await supabase.auth.getUser(); // refreshes session if needed

  return res;
}

