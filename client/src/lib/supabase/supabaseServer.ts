'use server'
// Helper function to ensure we have a valid session before making requests
import { supabase } from "../supabaseClient";

export async function getAuthenticatedSupabase() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Session error:', error);
    throw new Error('Authentication failed');
  }
  
  if (!session?.user) {
    throw new Error('No authenticated user');
  }
  
  return { supabase, session, user: session.user };
}

// Helper function for authenticated requests
export async function makeAuthenticatedRequest<T>(
  requestFn: (supabase: any) => Promise<{ data: T; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    const { supabase: authSupabase } = await getAuthenticatedSupabase();
    return await requestFn(authSupabase);
  } catch (error) {
    console.error('Authenticated request failed:', error);
    return { data: null, error };
  }
}