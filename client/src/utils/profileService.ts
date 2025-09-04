// import { apiClient } from './api-client'; // or whatever you're using

// import type { UserProfile } from '@/types';
// import type { ApiResponse } from '@/types/api'; // assuming you created this

// export async function updateUserProfile(
//   userId: string,
//   updates: Partial<UserProfile>
// ): Promise<ApiResponse<UserProfile>> {
//   try {
//     const response = await apiClient.put(`/users/${userId}/profile`, updates);
//     return {
//       success: true,
//       data: response.data,
//     };
//   } catch (err: any) {
//     return {
//       success: false,
//       error: err?.message || 'Failed to update profile',
//     };
//   }
// }