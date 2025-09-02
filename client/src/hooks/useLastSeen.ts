// "use client";

// import { useEffect } from "react";
// import { updateUserProfile } from "@/utils/subscription-service";
// import { useUserContext } from "@/hooks/useUserContext";
// import type { EnhancedUserProfile } from "@/types";

// export function useLastSeen() {
//   const user = useUserContext();

//   useEffect(() => {
//     const userId = user?.id;
//     if (!userId) return;

//     const updateLastSeen = async () => {
//       try {
//         const updates: Partial<EnhancedUserProfile> = {
//           lastSeen: new Date().toISOString(),
//         };

//         await updateUserProfile(userId, updates);
//       } catch (err) {
//         console.error("Failed to update lastSeen:", err);
//       }
//     };

//     updateLastSeen();

//     const interval = setInterval(updateLastSeen, 15 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, [user?.id]);
// }