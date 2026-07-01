import { NavLink, useNavigate } from 'react-router-dom'
import {
  Network, Sun, Moon, LogOut, ShieldCheck, Stethoscope, Pill,
  FileStack, Settings2, Bell, ChevronDown,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const NAV_BY_ROLE = {
  patient: [
    { to: '/patient', label: 'My Records', icon: ShieldCheck },
  ],
  doctor: [
    { to: '/clinic', label: 'Clinic Dashboard', icon: Stethoscope },
  ],
  nurse: [
    { to: '/clinic', label: 'Clinic Dashboard', icon: Stethoscope },
  ],
  pharmacist: [
    { to: '/pharmacy', label: 'Pharmacy Dashboard', icon: Pill },
  ],
  insurance: [
    { to: '/insurance', label: 'Claims & Coverage', icon: FileStack },
  ],
  admin: [
    { to: '/admin', label: 'Platform Admin', icon: Settings2 },
  ],
}

export default function AppShell({ children }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = user ? NAV_BY_ROLE[Object.keys(NAV_BY_ROLE).find(r =>
    user.role === r) ] || [] : []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center shrink-0">
            <Network className="h-4.5 w-4.5 text-white" size={18} />
          </div>
          <div className="leading-tight">
            <p className="font-[var(--font-display)] font-semibold text-sm text-[var(--color-text)]">Kigali Health</p>
            <p className="text-[11px] text-faint -mt-0.5">Unified Network</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]'
                }`
              }
            >
              <item.icon size={17} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-faint">Appearance</span>
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[var(--color-brand)] flex items-center justify-center">
              <Network className="text-white" size={15} />
            </div>
            <span className="font-[var(--font-display)] font-semibold text-sm">Kigali Health</span>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <button className="relative h-9 w-9 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 rounded-full border border-[var(--color-border)] pl-1.5 pr-2.5 py-1.5 hover:bg-[var(--color-surface-alt)] transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)] flex items-center justify-center text-xs font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-semibold text-[var(--color-text)]">{user?.name}</p>
                  <p className="text-[10px] text-faint">{user?.institution || 'Patient'}</p>
                </div>
                <ChevronDown size={14} className="text-faint" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 card p-1.5 shadow-lg z-20">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 bg-[var(--color-surface-alt)] px-5 py-6 md:px-8 md:py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
