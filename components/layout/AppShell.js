'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ROLE_NAV, ALWAYS_ALLOWED_ROUTES, ALL_ROUTE_KEYS } from '@/data/roles';
import Sidebar from './Sidebar';
import Header from './Header';

const PUBLIC_PATHS = ['/', '/login'];

export default function AppShell({ children }) {
  const { state, hydrated } = useApp();
  const { user, sidebarCollapsed } = state;
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const routeKey = pathname.split('/')[1];
  const isKnownRoute = ALL_ROUTE_KEYS.includes(routeKey);
  const hasRouteAccess = !user || ALWAYS_ALLOWED_ROUTES.includes(routeKey) || (ROLE_NAV[user.role] || []).includes(routeKey);
  const isBlocked = isKnownRoute && !hasRouteAccess;

  useEffect(() => {
    if (!hydrated) return;
    if (!isPublic && !user) {
      router.replace('/login');
      return;
    }
    // Sidebar only hides the link — this actually enforces it. Unknown
    // routes (not just unauthorized ones) fall through to the 404 page
    // instead of bouncing to dashboard.
    if (!isPublic && user && isBlocked) {
      router.replace('/dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, pathname]);

  if (!hydrated && !isPublic) return null;
  if (isPublic) return <>{children}</>;
  if (!user) return null;
  if (isBlocked) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-h-bg">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 overflow-hidden ${
          sidebarCollapsed ? 'lg:ml-[70px]' : 'lg:ml-[256px]'
        }`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
