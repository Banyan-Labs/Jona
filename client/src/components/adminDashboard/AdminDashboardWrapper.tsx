
// // client/src/components/admin/AdminDashboardWrapper.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { AdminDashboard } from '@/components/AdminDashboard/AdminDashboard';
// import type { AuthUser } from '@/types/index';
// import { FilterOptions } from '@/types/admin';
// interface AdminDashboardWrapperProps {
//   user: AuthUser;
//   children?: React.ReactNode;
// }

// export default function AdminDashboardWrapper({ user, children }: AdminDashboardWrapperProps) {
//   const [currentPage, setCurrentPage] = useState('admin/dashboard');
//   const router = useRouter();

//   // You can use this for any navigation logic within the wrapper if needed
//   const handleNavigation = (page: string) => {
//     setCurrentPage(page);
//     if (page.startsWith('admin/')) {
//       router.push(`/${page}`);
//     } else {
//       router.push(`/admin/${page}`);
//     }
//   };

//   return (
//     <>
//       <AdminDashboard
//         initialJobs={[]}
//         initialFilters={{ status: 'admin' }}
//         user={user}
//         role="admin"
//       />
//       {children}
//     </>
//   );
// }