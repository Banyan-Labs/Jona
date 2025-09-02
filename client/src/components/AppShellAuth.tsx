'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthUserContext';
import AppShell from '@/components/AppShell';
import type { AuthUser } from '@/types/index';

interface AppShellAuthProps {
  children?: React.ReactNode; // Make optional
  initialUser?: AuthUser | null;
}
export default function AppShellAuth({ children }: AppShellAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authUser, isAuthenticated, isAdmin, loading } = useAuth();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const resetAuthTimeout = () => {
    console.log('🔄 Session timeout reset');
    setShowTimeoutWarning(false);
  };

  const handleLogout = async () => {
    console.log('🔒 Logging out...');
    // Add your logout logic here (e.g. supabase.auth.signOut())
    router.push('/login');
  };

  useEffect(() => {
    if (loading || isAuthenticated === undefined) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!isAuthenticated && !isAuthPage) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && authUser && isAuthPage) {
      const targetPath = (authUser?.role === 'admin' || isAdmin)
        ? '/admin/dashboard'
        : '/dashboard';
      router.push(targetPath);
      return;
    }

    if (
      isAuthenticated &&
      pathname.startsWith('/admin') &&
      authUser?.role !== 'admin' &&
      !isAdmin
    ) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, isAdmin, pathname, router, authUser, loading]);

  if (loading || isAuthenticated === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
  <AppShell initialUser={authUser ?? null}>
  {children}
</AppShell>

  );
}