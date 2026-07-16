'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';

const PUBLIC_PATHS = ['/', '/login'];

export default function AppShell({ children }) {
  const { state, hydrated } = useApp();
  const { user, sidebarCollapsed } = state;
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!hydrated) return;
    if (!isPublic && !user) {
      router.replace('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, pathname]);

  // Show nothing while hydrating on protected pages
  if (!hydrated && !isPublic) return null;

  // Public pages render without shell
  if (isPublic || !user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-h-bg overflow-hidden">
      <Sidebar />
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300 overflow-hidden"
        style={{ marginLeft: sidebarCollapsed ? '70px' : '256px' }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
