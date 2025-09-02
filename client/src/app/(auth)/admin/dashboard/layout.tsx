
// // client/src/app/admin/layout.tsx
// 'use client';
// import type { ReactNode } from 'react';

// // Since AppShellAuth handles all authentication and routing logic,
// // we can simplify this layout to just pass through children
// export default function AdminLayout({ children }: { children: ReactNode }) {
//   return <>{children}</>;
// }

// client\src\app\(auth)\admin\dashboard\layout.tsx
'use server'
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const role = session?.user?.user_metadata?.role;

  if (role !== 'admin') {
    redirect('/login');
  }


  return <>{children}</>;


}