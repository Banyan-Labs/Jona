// // client/src/components/profile/ProfilePageWrapper.tsx
// 'use client'
// import { AuthUser } from '@/types'
// import Profile from '@/components/profile/Profile'
// import { useAuth } from '@/context/AuthUserContext'
// import { useRouter } from 'next/navigation'
// import { useCallback } from 'react'
// import { UserSettings, EnhancedUserProfile } from '@/types'
// interface ProfilePageProps {
//   user: AuthUser;
//   setCurrentPageAction: (page: string) => void;
// }
// export default function ProfilePageWrapper() {
//   const { authUser, loading, signOut } = useAuth()
//   const router = useRouter()

//   const handleLogout = useCallback(async () => {
//     try {
//       await signOut()
//       router.push('/login')
//     } catch (error) {
//       console.error('Logout error:', error)
//     }
//   }, [signOut, router])

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-2 text-gray-600">Loading profile...</p>
//         </div>
//       </div>
//     )
//   }
// if (!authUser) {
//   return null; // or a fallback/loading state
// }



//   return (

// <Profile
//   user={authUser}
//   setCurrentPageAction={(page) => router.push(`/${page}`)}
// />


//   )
// }

// // client\src\app\(auth)\profile\page.tsx
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { AuthUser, toAuthUser } from "@/types";
// import  Profile  from "@/components/profile/Profile";
// import { UserService } from "@/utils/user-service";
// import { SubscriptionService } from "@/utils/subscription-service"; // ✅ match filename
// import { ProfilePageProps } from "@/types";

// import {UsagePayload, EnhancedUserProfile} from '@/types/index'
// // import  getUsagePayload } from "@/utils/subscription-service";

// export default async function ProfilePage() {
//   const supabase = createServerComponentClient({ cookies });
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   if (!session?.user) return null;

//   const authUser: AuthUser = toAuthUser(session.user);
//   const userService = new UserService();
//   const subscriptionService = new SubscriptionService();

// const [profile, settings, subscription, usagePayload] = await Promise.all([
//   userService.getUserProfile(authUser.id),
//   userService.getUserSettings(authUser.id),
//   SubscriptionService.getCurrentSubscription(authUser.id), // ✅ static call
//   SubscriptionService.getUsagePayload(authUser.id),        // ✅ static call
// ]);
// const enhancedUserProfile: EnhancedUserProfile = {
//   ...(profile ?? {}),
//   id: profile?.id ?? authUser.id, // fallback to authUser.id if needed
//   current_subscription: subscription ?? null,
//   usage: usagePayload ?? null,
// };

//   return (
//     <Profile
//       user={authUser}
//       enhancedUserProfile={enhancedUserProfile}
//   settings={settings ?? { id: authUser.id, notification_push: true }}
//     />
//   );
// }
