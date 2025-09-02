'use server';

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { toAuthUser, type AuthUser } from '@/types/authUser';
import { redirect } from 'next/navigation';

/**
 * Retrieves the current authenticated user and session from Supabase.
 */
export async function getServerAuth(): Promise<{
  user: AuthUser | null;
  session: any;
  error: Error | null;
}> {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return { user: null, session: null, error };
    }

    return {
      user: toAuthUser(session.user),
      session,
      error: null,
    };
  } catch (error) {
    console.error('getServerAuth error:', error);
    return { user: null, session: null, error: error instanceof Error ? error : null };
  }
}

/**
 * Redirects to /login if no authenticated user is found.
 */
export async function requireServerAuth(): Promise<AuthUser> {
  const { user, error } = await getServerAuth();
  if (!user || error) redirect('/login');
  return user;
}

/**
 * Redirects to /dashboard if user is not an admin.
 */

export async function requireAdminAuth() {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) throw new Error("Admin authentication required");

  return toAuthUser(data.user);
}



/**
 * Returns the current authenticated user or null.
 */
export async function getUserServer(): Promise<AuthUser | null> {
  const { user } = await getServerAuth();
  return user;
}