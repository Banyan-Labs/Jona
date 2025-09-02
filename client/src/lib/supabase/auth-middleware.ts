'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { toAuthUser, type AuthUser } from '@/types/authUser';

// 🧠 Server Component Client
export const getServerClient = () =>
  createServerComponentClient<Database>({ cookies });

// 🔐 Auth Fetcher
export async function getServerAuth(): Promise<{
  user: AuthUser | null;
  error: Error | null;
}> {
  try {
    const supabase = getServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return { user: null, error };
    return { user: toAuthUser(user), error: null };
  } catch (error) {
    console.error('getServerAuth error:', error);
    return { user: null, error: error instanceof Error ? error : null };
  }
}

// 🔒 Require Auth
export async function requireServerAuth(): Promise<AuthUser> {
  const { user, error } = await getServerAuth();
  if (!user || error) redirect('/login');
  return user;
}

// 🔐 Require Admin
export async function requireAdminAuth(): Promise<AuthUser> {
  const user = await requireServerAuth();
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
}

// 🔒 Require User (Alias)
export async function requireUserAuth(): Promise<AuthUser> {
  return requireServerAuth(); // semantic alias
}

// 👤 Get User or Null
export async function getUserServer(): Promise<AuthUser | null> {
  const { user } = await getServerAuth();
  return user;
}
