'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ROLE_NAV, ALWAYS_ALLOWED_ROUTES } from '@/data/roles';
import Sidebar from './Sidebar';
import Header from './Header';

const PUBLIC_PATHS = ['/', '/login'];

export default function AppShell({ children }) {
  const { state, hydrated } = useApp();
  const { user, sidebarCollapsed } = state;
  const isDark = state.theme === 'dark';
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const routeKey = pathname.split('/')[1];
  const hasRouteAccess = !user || ALWAYS_ALLOWED_ROUTES.includes(routeKey) || (ROLE_NAV[user.role] || []).includes(routeKey);

  useEffect(() => {
    if (!hydrated) return;
    if (!isPublic && !user) {
      router.replace('/login');
      return;
    }
    // Sidebar links are already filtered per role, but that only hides the
    // link — it doesn't stop someone typing the URL directly (or switching
    // accounts and landing on a page the new role can't see). Enforce it here.
    if (!isPublic && user && !hasRouteAccess) {
      router.replace('/dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, pathname]);

  // Show nothing while hydrating on protected pages
  if (!hydrated && !isPublic) return null;

  // Public pages render without shell
  if (isPublic || !user) return <>{children}</>;

  // Don't flash disallowed content while the redirect above is in flight
  if (!hasRouteAccess) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Same photo as the login page, same theme-aware treatment — the
          sidebar and header sit opaque/frosted on top, cards stay solid;
          this only shows through the gaps around them. -z-10 (rather than
          the relative-on-every-sibling trick used on the login page) keeps
          it reliably behind everything without touching Sidebar/Header/main. */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center scale-110"
        style={{
          backgroundImage: "url('/login-hero.jpg')",
          filter: isDark ? 'blur(28px) brightness(1.1)' : 'blur(28px) brightness(1.7) saturate(0.85)',
        }}
      />
      <div className={`fixed inset-0 -z-10 ${isDark ? 'bg-h-bg/85' : 'bg-h-bg/50'}`} />

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
