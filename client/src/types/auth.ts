// // types/auth.ts - Additional auth utilities (no duplicates)
// import type { User, Session } from "@supabase/supabase-js";
// import type { AuthUser, UserRole } from "./authUser"; // Import from authUser.ts

// export type SupabaseUser = User;
// export type SupabaseSession = Session;
// export type SuperUserRole = Extract<UserRole, "admin">;
// export type MetadataValue = string | number | boolean | null | undefined;

// export interface UserMetadata {
//   full_name?: string;
//   role?: UserRole;
//   [key: string]: MetadataValue;
// }

// export interface PublicUser {
//   id: string;
//   name?: string;
//   email?: string;
//   role: UserRole;
// }

// export interface SlimUser {
//   id: string;
//   email?: string;
// }

// export type UserType = Pick<PublicUser, "id" | "email" | "name"> | null;

// // Re-export from authUser.ts to maintain compatibility
// export type { AuthUser, UserRole } from "./authUser";
// export { toAuthUser } from "./authUser";

// // Helper function for when you need to assert non-null
// export function toAuthUserRequired(user: SupabaseUser | null): AuthUser {
//   const { toAuthUser } = require("./authUser");
//   const authUser = toAuthUser(user);
//   if (!authUser) {
//     throw new Error('Invalid or missing user data');
//   }
//   return authUser;
// }