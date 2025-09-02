'use server';

import { requireUserAuth } from '@/lib/supabase/auth-middleware';
import { getUserProfile,getUserSettings } from "@/app/services/user/user-server"

import Profile from '@/components/profile/Profile';
import type { EnhancedUserProfile } from '@/types';

export default async function ProfilePage() {
  const authUser = await requireUserAuth();

  const [profile, settings] = await Promise.all([
    getUserProfile(authUser.id),
   getUserSettings(authUser.id),
  ]);

  const enhancedUserProfile: EnhancedUserProfile = {
    ...(profile ?? {}),
    id: profile?.id ?? authUser.id,
    // Uncomment when ready:
    // current_subscription: subscription ?? null,
    // usage: usagePayload ?? null,
  };

  const safeSettings = {
    id: authUser.id,
    notification_push: true,
    ...settings,
  };

  return (
    <Profile
      user={authUser}
      enhancedUserProfile={enhancedUserProfile}
      settings={safeSettings}
    />
  );
}
