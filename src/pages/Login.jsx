import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Network, Moon, Sun, ShieldCheck, Stethoscope, HeartPulse, Pill, FileStack, Settings2, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ROLES } from '../data/mockData'

const ROLE_CARDS = [
  { key: 'patient', icon: ShieldCheck, blurb: 'View your records & manage consent' },
  { key: 'doctor', icon: Stethoscope, blurb: 'Clinical entry & interaction flags' },
  { key: 'nurse', icon: HeartPulse, blurb: 'Vitals & intake' },
  { key: 'pharmacist', icon: Pill, blurb: 'Verify & dispense prescriptions' },
  { key: 'insurance', icon: FileStack, blurb: 'Coverage checks & claims' },
  { key: 'admin', icon: Settings2, blurb: 'Institutions, tokens & audit' },
]

const ROUTE_BY_ROLE = {
  patient: '/patient',
  doctor: '/clinic',
  nurse: '/clinic',
  pharmacist: '/pharmacy',
  insurance: '/insurance',
  admin: '/admin',
}

export default function Login() {
  const [selected, setSelected] = useState(null)
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleEnter = () => {
    if (!selected) return
    login(selected)
    navigate(ROUTE_BY_ROLE[selected])
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)] flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center">
            <Network className="text-white" size={17} />
          </div>
          <span className="font-[var(--font-display)] font-semibold text-[var(--color-text)]">Kigali Health Network</span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-accent)] mb-3">
              Demo sign-in · simulated JWT + RBAC
            </p>
            <h1 className="font-[var(--font-display)] text-3xl md:text-4xl font-semibold text-[var(--color-text)] mb-3">
              Choose a role to enter
            </h1>
            <p className="text-[var(--color-text-muted)] max-w-md mx-auto text-sm">
              Each role receives a token scoped to its permissions — the interface and data shown adapt accordingly.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {ROLE_CARDS.map(({ key, icon: Icon, blurb }) => {
              const profile = ROLES[key]
              const active = selected === key
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`text-left card p-4 transition-all ${
                    active
                      ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/30'
                      : 'hover:border-[var(--color-text-faint)]'
                  }`}
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${
                    active ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]'
                  }`}>
                    <Icon size={17} />
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{profile.label}</p>
                  <p className="text-xs text-faint mt-0.5 leading-snug">{blurb}</p>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handleEnter}
              disabled={!selected}
              className="flex items-center gap-2 rounded-full bg-[var(--color-brand)] disabled:bg-[var(--color-text-faint)] disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3 hover:bg-[var(--color-brand-strong)] transition-colors"
            >
              Enter dashboard
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-[11px] text-faint">
        ALU Enterprise Systems Project — Prototype interface only. No real patient data.
      </footer>
    </div>
  )
}
