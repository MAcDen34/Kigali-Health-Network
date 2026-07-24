'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ROLES, ROLE_NAV, ROLE_ACCENT, DEMO_USERS } from '@/data/roles';
import {
  LayoutDashboard, ShieldCheck, Stethoscope, Pill, FileStack,
  Settings2, ChevronLeft, ChevronRight, ChevronsUpDown, LogOut,
  Activity, Heart, Cross, Building2,
} from 'lucide-react';

// Notifications is reached via the header bell only, not listed here.
const ALL_NAV = [
  { key:'dashboard', href:'/dashboard',    label:'Dashboard',       icon:LayoutDashboard },
  { key:'records',   href:'/records',      label:'My Records',      icon:ShieldCheck },
  { key:'clinic',    href:'/clinic',       label:'Clinic',          icon:Stethoscope },
  { key:'pharmacy',  href:'/pharmacy',     label:'Pharmacy',        icon:Pill },
  { key:'insurance', href:'/insurance',    label:'Claims',          icon:FileStack },
  { key:'admin',     href:'/admin',        label:'Platform Admin',  icon:Settings2 },
  { key:'audit',     href:'/audit',        label:'Audit Trail',     icon:Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const { user, sidebarCollapsed } = state;
  const [switcherOpen, setSwitcherOpen] = useState(false);
  if (!user) return null;

  const allowed = ROLE_NAV[user.role] || [];
  const navItems = ALL_NAV.filter(n => allowed.includes(n.key));
  const accent = ROLE_ACCENT[user.role] || '#5A8AA6';

  const switchTo = (nextUser) => {
    dispatch({ type:'LOGIN', payload:nextUser });
    setSwitcherOpen(false);
    router.push('/dashboard');
  };

  const NavLink = ({ item }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        title={sidebarCollapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
          isActive ? 'text-white shadow-sm' : 'text-h-text-muted hover:text-h-text hover:bg-h-bg'
        }`}
        style={isActive ? { backgroundColor: accent } : {}}
      >
        <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-h-text-light group-hover:text-h-text-muted'}`} strokeWidth={isActive ? 2.5 : 2} />
        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => dispatch({ type:'TOGGLE_SIDEBAR' })} />
      )}
      <aside className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out border-r border-h-border bg-h-surface print:hidden
        ${sidebarCollapsed ? 'w-[70px] -translate-x-full lg:translate-x-0' : 'w-[256px] translate-x-0'}`}
      >
        <div className="flex items-center h-[68px] px-4 border-b border-h-border flex-shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ backgroundColor: accent }}>
                <Cross className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <div className="min-w-0">
                <p className="text-h-text font-bold text-sm leading-tight">Kigali Health</p>
                <p className="text-h-text-light text-[10px] leading-tight mt-0.5">Unified Network · KUPRIN</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto shadow-sm" style={{ backgroundColor: accent }}>
              <Cross className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-xl" style={{ backgroundColor: `${accent}14` }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: accent }}>Signed in as</p>
            <p className="text-h-text text-xs font-medium truncate mt-0.5">{ROLES[user.role]}</p>
            {user.institution && <p className="text-h-text-light text-[9px] truncate mt-0.5">{user.institution}</p>}
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin space-y-0.5">
          {navItems.map(item => <NavLink key={item.key} item={item} />)}
        </nav>

        <div className="border-t border-h-border p-3 flex-shrink-0">
          {!sidebarCollapsed && (
            <div className="relative mb-2">
              <button
                onClick={() => setSwitcherOpen(v => !v)}
                className="flex items-center gap-2.5 px-2 py-2 w-full rounded-xl hover:bg-h-bg transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: accent }}>
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-h-text text-xs font-semibold truncate">{user.name}</p>
                  <p className="text-h-text-light text-[10px] truncate">{user.email}</p>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-h-text-light flex-shrink-0" />
              </button>

              {switcherOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSwitcherOpen(false)} />
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-h-surface border border-h-border rounded-xl shadow-modal py-1.5 z-50 animate-scale-in max-h-72 overflow-y-auto scrollbar-thin">
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-h-text-light">Switch account</p>
                    {DEMO_USERS.filter(u => u.id !== user.id).map(u => {
                      const uAccent = ROLE_ACCENT[u.role] || '#5A8AA6';
                      return (
                        <button
                          key={u.id}
                          onClick={() => switchTo(u)}
                          className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-h-bg transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: uAccent }}>
                            {u.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-h-text truncate">{u.name}</p>
                            <p className="text-[10px] text-h-text-light truncate">{ROLES[u.role]}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
          <button
            onClick={() => dispatch({ type:'LOGOUT' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-h-red/80 hover:text-h-red hover:bg-h-red-light text-sm transition-colors"
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        <button
          onClick={() => dispatch({ type:'TOGGLE_SIDEBAR' })}
          className="hidden lg:flex absolute -right-3 top-[68px] mt-4 w-6 h-6 rounded-full items-center justify-center text-h-text-muted hover:text-h-text transition-colors border border-h-border bg-h-surface shadow-sm"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </>
  );
}
