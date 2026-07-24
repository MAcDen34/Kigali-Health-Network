'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ROLES, ROLE_ACCENT } from '@/data/roles';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Menu, Bell, ChevronRight, Search, Users, Pill, FileStack, Building2, Activity, FileText, ShieldCheck } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard':     ['Overview',         'Dashboard'],
  '/records':       ['Patient Portal',   'My Records & Consent'],
  '/clinic':        ['Clinical Service', 'Clinic Dashboard'],
  '/pharmacy':      ['Pharmacy Service', 'Prescription Queue'],
  '/insurance':     ['Insurance Service','Claims & Coverage'],
  '/admin':         ['Platform Admin',   'Administration'],
  '/notifications': ['Notifications',    'All Notifications'],
  '/audit':         ['Security',         'Audit Trail'],
  '/profile':       ['Account',          'Profile'],
};

// Scoped to whatever the signed-in role can see, same as AppShell's route guard.
function getSearchResults(role, state, query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const results = [];
  const push = (icon, label, subtitle, href) => results.push({ icon, label, subtitle, href, key: `${label}·${subtitle}` });

  if (role === 'PATIENT') {
    state.medicalHistory
      .filter(m => m.patient === state.patientProfile.name)
      .filter(m => m.detail.toLowerCase().includes(q) || m.type.toLowerCase().includes(q) || m.institution.toLowerCase().includes(q))
      .forEach(m => push(FileText, m.detail, `${m.type} · ${m.institution}`, '/records'));
    state.consents
      .filter(c => c.institution.toLowerCase().includes(q))
      .forEach(c => push(ShieldCheck, c.institution, `${c.type} consent`, '/records'));
  }

  if (role === 'DOCTOR' || role === 'NURSE') {
    state.clinicPatients
      .filter(p => p.name.toLowerCase().includes(q))
      .forEach(p => push(Users, p.name, `Age ${p.age} · ${p.diagnosis}`, `/clinic?patient=${encodeURIComponent(p.name)}`));
    state.prescriptions
      .filter(rx => rx.drug.toLowerCase().includes(q) || rx.patient.toLowerCase().includes(q) || rx.code.toLowerCase().includes(q))
      .forEach(rx => push(Pill, rx.drug, `${rx.patient} · ${rx.code}`, `/clinic?patient=${encodeURIComponent(rx.patient)}`));
  }

  if (role === 'PHARMACIST') {
    state.prescriptions
      .filter(rx => rx.drug.toLowerCase().includes(q) || rx.patient.toLowerCase().includes(q) || rx.code.toLowerCase().includes(q))
      .forEach(rx => push(Pill, rx.drug, `${rx.patient} · ${rx.code}`, `/pharmacy?q=${encodeURIComponent(rx.code)}`));
  }

  if (role === 'INSURANCE_AGENT') {
    state.claims
      .filter(c => c.patient.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.institution.toLowerCase().includes(q))
      .forEach(c => push(FileStack, c.patient, `${c.id} · RWF ${c.amount.toLocaleString()}`, `/insurance?claim=${encodeURIComponent(c.id)}`));
  }

  if (role === 'PLATFORM_ADMIN') {
    state.institutions
      .filter(i => i.name.toLowerCase().includes(q) || i.type.toLowerCase().includes(q))
      .forEach(i => push(Building2, i.name, i.type, '/admin'));
    state.platformAudit
      .filter(a => a.actor.toLowerCase().includes(q) || a.action.toLowerCase().includes(q))
      .forEach(a => push(Activity, a.action, a.actor, '/audit'));
  }

  return results.slice(0, 6);
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const { user, notifications } = state;
  const unread = notifications?.filter(n => n.role === user?.role && !n.read).length || 0;
  const [section, title] = PAGE_TITLES[pathname] || ['', pathname.replace('/','')];
  const accent = ROLE_ACCENT[user?.role] || '#5A8AA6';
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [bellShake, setBellShake] = useState(false);
  const prevUnread = useRef(null);

  // Shakes once when unread rises, including on first load if already unread.
  useEffect(() => {
    const justIncreased = prevUnread.current !== null && unread > prevUnread.current;
    const arrivedWithUnread = prevUnread.current === null && unread > 0;
    if (justIncreased || arrivedWithUnread) {
      setBellShake(true);
      const t = setTimeout(() => setBellShake(false), 650);
      prevUnread.current = unread;
      return () => clearTimeout(t);
    }
    prevUnread.current = unread;
  }, [unread]);

  if (!user) return null;

  const results = getSearchResults(user.role, state, query);
  const showDropdown = query.trim().length >= 2;

  const goTo = (href) => {
    router.push(href);
    setQuery('');
  };

  return (
    <header className="sticky top-0 z-20 bg-h-surface/90 backdrop-blur-xl border-b border-h-border">
      <div className="flex items-center justify-between h-[68px] px-4 lg:px-6">
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

        <div className="flex items-center gap-2">
          <div className="hidden md:block relative w-52">
            <div
              className="flex items-center gap-2 bg-h-bg border border-h-border rounded-xl px-3 py-2 transition-colors"
              style={searchFocused ? { backgroundColor:'rgb(var(--color-h-surface))', borderColor:accent, boxShadow:`0 0 0 3px ${accent}25` } : {}}
            >
              <Search className="w-3.5 h-3.5 text-h-text-light flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={e => { if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); } }}
                className="bg-transparent text-sm text-h-text placeholder:text-h-text-light focus:outline-none w-full"
              />
            </div>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setQuery('')} />
                <div className="absolute left-0 right-0 top-full mt-2 bg-h-surface border border-h-border rounded-xl shadow-modal py-1.5 z-50 animate-scale-in max-h-80 overflow-y-auto scrollbar-thin">
                  {results.length === 0 ? (
                    <p className="px-3.5 py-3 text-sm text-h-text-muted">No results for &ldquo;{query}&rdquo;</p>
                  ) : (
                    results.map(r => {
                      const Icon = r.icon;
                      return (
                        <button
                          key={r.key}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => goTo(r.href)}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2.5 hover:bg-h-bg transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-lg bg-h-bg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 text-h-text-muted" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-h-text truncate">{r.label}</p>
                            <p className="text-xs text-h-text-light truncate">{r.subtitle}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>

          <ThemeToggle />

          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl hover:bg-h-bg transition-colors"
          >
            <Bell className={`w-4.5 h-4.5 text-h-text-muted origin-top ${bellShake ? 'animate-shake' : ''}`} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-h-red text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 animate-pulse-slow">
                {unread}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-2.5 pl-3 ml-1 border-l border-h-border rounded-r-xl pr-2 py-1.5 hover:bg-h-bg transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
              style={{ backgroundColor: accent }}>
              {user.avatar}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-h-text leading-tight">{user.name}</p>
              <p className="text-[10px] text-h-text-muted">{ROLES[user.role]}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
