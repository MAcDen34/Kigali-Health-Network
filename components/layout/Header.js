'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ROLES, ROLE_ACCENT } from '@/data/roles';
import { Menu, Bell, ChevronRight, Search } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard':     ['Overview',         'Dashboard'],
  '/records':       ['Patient Portal',   'My Records & Consent'],
  '/clinic':        ['Clinical Service', 'Clinic Dashboard'],
  '/pharmacy':      ['Pharmacy Service', 'Prescription Queue'],
  '/insurance':     ['Insurance Service','Claims & Coverage'],
  '/admin':         ['Platform Admin',   'Administration'],
  '/notifications': ['Notifications',    'All Notifications'],
  '/audit':         ['Security',         'Audit Trail'],
};

export default function Header() {
  const pathname = usePathname();
  const { state, dispatch } = useApp();
  const { user, notifications } = state;
  const unread = notifications?.filter(n => !n.read).length || 0;
  const [section, title] = PAGE_TITLES[pathname] || ['', pathname.replace('/','')];
  const accent = ROLE_ACCENT[user?.role] || '#1B6EF3';

  if (!user) return null;

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-h-border">
      <div className="flex items-center justify-between h-[68px] px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch({ type:'TOGGLE_SIDEBAR' })}
            className="lg:hidden p-2 rounded-xl hover:bg-h-bg transition-colors"
          >
            <Menu className="w-5 h-5 text-h-text-muted" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-h-text-light mb-0.5">
              <span>KUPRIN</span>
              <ChevronRight className="w-3 h-3" />
              <span>{section}</span>
              {title !== section && <>
                <ChevronRight className="w-3 h-3" />
                <span className="font-medium" style={{ color: accent }}>{title}</span>
              </>}
            </div>
            <h1 className="text-[17px] font-bold text-h-text leading-tight">{title}</h1>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-h-bg border border-h-border rounded-xl px-3 py-2 w-52">
            <Search className="w-3.5 h-3.5 text-h-text-light flex-shrink-0" />
            <input
              type="text"
              placeholder="Search…"
              className="bg-transparent text-sm text-h-text placeholder:text-h-text-light outline-none w-full"
            />
          </div>

          {/* Bell */}
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl hover:bg-h-bg transition-colors"
          >
            <Bell className="w-4.5 h-4.5 text-h-text-muted" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-h-red text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 animate-pulse-slow">
                {unread}
              </span>
            )}
          </Link>

          {/* User chip */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-h-border ml-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ backgroundColor: accent }}>
              {user.avatar}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-h-text leading-tight">{user.name}</p>
              <p className="text-[10px] text-h-text-muted">{ROLES[user.role]}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
