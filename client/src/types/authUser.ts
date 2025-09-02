import type { User, Session } from "@supabase/supabase-js";

// Supabase primitives
export type SupabaseUser = User;
export type SupabaseSession = Session;

// Role typing
export type UserRole = "admin" | "user" | "job_seeker";
export type SuperUserRole = Extract<UserRole, "admin">;

// Metadata typing
export type MetadataValue = string | number | boolean | null | undefined;

export interface UserMetadata {
  full_name?: string;
  role?: UserRole;
  [key: string]: MetadataValue;
}

// Core user shapes
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  aud: string;
  created_at: string;
  app_metadata: Record<string, MetadataValue>;
  user_metadata: UserMetadata;
}

export interface PublicUser {
  id: string;
  name?: string;
  email?: string;
  role: UserRole;
}

export interface SlimUser {
  id: string;
  email?: string;
}

export type UserType = Pick<PublicUser, "id" | "email" | "name"> | null;

//
// Conversion utilities
//

/**
 * Converts a SupabaseUser into an AuthUser, or returns null if invalid.
 */
export function toAuthUser(user: SupabaseUser | null): AuthUser | null {
  if (!user?.id || !user?.email) return null;

  const appMeta = user.app_metadata ?? {};
  const userMeta = user.user_metadata ?? {};
  const rawRole = appMeta.role ?? userMeta.role;

  const role: UserRole =
    rawRole === "admin" || rawRole === "user" || rawRole === "job_seeker"
      ? rawRole
      : "user";

  return {
    id: user.id,
    email: user.email,
    role,
    aud: user.aud ?? "",
    created_at: user.created_at ?? "",
    app_metadata: appMeta,
    user_metadata: userMeta,
  };
}

/**
 * Converts a SupabaseUser into an AuthUser and throws if invalid.
 */
export function toAuthUserRequired(user: SupabaseUser | null): AuthUser {
  const authUser = toAuthUser(user);
  if (!authUser) {
    throw new Error("Invalid or missing user data");
  }
  return authUser;
}