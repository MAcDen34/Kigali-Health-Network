'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ROLES, ROLE_NAV, ROLE_ACCENT } from '@/data/roles';
import {
  LayoutDashboard, ShieldCheck, Stethoscope, Pill, FileStack,
  Settings2, Bell, ChevronLeft, ChevronRight, LogOut,
  Activity, Heart, Cross, Building2,
} from 'lucide-react';

const ALL_NAV = [
  { key:'dashboard', href:'/dashboard',    label:'Dashboard',       icon:LayoutDashboard },
  { key:'records',   href:'/records',      label:'My Records',      icon:ShieldCheck },
  { key:'clinic',    href:'/clinic',       label:'Clinic',          icon:Stethoscope },
  { key:'pharmacy',  href:'/pharmacy',     label:'Pharmacy',        icon:Pill },
  { key:'insurance', href:'/insurance',    label:'Claims',          icon:FileStack },
  { key:'admin',     href:'/admin',        label:'Platform Admin',  icon:Settings2 },
  { key:'notifications',href:'/notifications',label:'Notifications',icon:Bell },
  { key:'audit',     href:'/audit',        label:'Audit Trail',     icon:Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { state, dispatch } = useApp();
  const { user, sidebarCollapsed, notifications } = state;
  const unread = notifications?.filter(n => !n.read).length || 0;
  if (!user) return null;

  const allowed = ROLE_NAV[user.role] || [];
  const navItems = ALL_NAV.filter(n => allowed.includes(n.key));
  const accent = ROLE_ACCENT[user.role] || '#1B6EF3';

  const NavLink = ({ item }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;
    const showBadge = item.key === 'notifications' && unread > 0;
    return (
      <Link
        href={item.href}
        title={sidebarCollapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
          isActive ? 'text-white shadow-lg' : 'text-white/55 hover:text-white hover:bg-white/8'
        }`}
        style={isActive ? { backgroundColor: accent, boxShadow: `0 4px 14px ${accent}40` } : {}}
      >
        <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/45 group-hover:text-white'}`} strokeWidth={isActive ? 2.5 : 2} />
        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
        {showBadge && (
          <span className={`${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} bg-h-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1`}>
            {unread}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => dispatch({ type:'TOGGLE_SIDEBAR' })} />
      )}
      <aside className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out shadow-sidebar print:hidden
        ${sidebarCollapsed ? 'w-[70px] -translate-x-full lg:translate-x-0' : 'w-[256px] translate-x-0'}`}
        style={{ backgroundColor: '#0A1628' }}
      >
        {/* Logo */}
        <div className="flex items-center h-[68px] px-4 border-b border-white/8 flex-shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ backgroundColor: accent }}>
                <Cross className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight">Kigali Health</p>
                <p className="text-white/35 text-[10px] leading-tight mt-0.5">Unified Network · KUPRIN</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto shadow-lg" style={{ backgroundColor: accent }}>
              <Cross className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Role badge */}
        {!sidebarCollapsed && (
          <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-xl" style={{ backgroundColor: `${accent}18` }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: accent }}>Signed in as</p>
            <p className="text-white text-xs font-medium truncate mt-0.5">{ROLES[user.role]}</p>
            {user.institution && <p className="text-white/35 text-[9px] truncate mt-0.5">{user.institution}</p>}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin space-y-0.5">
          {navItems.map(item => <NavLink key={item.key} item={item} />)}
        </nav>

        {/* User */}
        <div className="border-t border-white/8 p-3 flex-shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: accent }}>
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-white/35 text-[10px] truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => dispatch({ type:'LOGOUT' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-sm transition-colors"
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => dispatch({ type:'TOGGLE_SIDEBAR' })}
          className="hidden lg:flex absolute -right-3 top-[68px] mt-4 w-6 h-6 rounded-full items-center justify-center text-white/50 hover:text-white transition-colors border border-white/15"
          style={{ backgroundColor: '#0A1628' }}
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </>
  );
}
