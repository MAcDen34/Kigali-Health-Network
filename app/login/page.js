'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { loginWithCredentials } from '@/utils/authUtils';
import { DEMO_USERS, ROLES, ROLE_ACCENT } from '@/data/roles';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Cross, Heart } from 'lucide-react';

const QUICK_DEMO = [
  { label:'Admin',       userId:'USR001' },
  { label:'Patient',     userId:'USR002' },
  { label:'Doctor',      userId:'USR003' },
  { label:'Nurse',       userId:'USR004' },
  { label:'Pharmacist',  userId:'USR005' },
  { label:'Insurance',   userId:'USR006' },
];

export default function LoginPage() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const user = await loginWithCredentials(email, password);
      dispatch({ type:'LOGIN', payload:user });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (userId) => {
    setDemoLoading(userId);
    const user = DEMO_USERS.find(u => u.id === userId);
    if (!user) return;
    await new Promise(r => setTimeout(r, 600));
    dispatch({ type:'LOGIN', payload:user });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-h-bg">
      {/* Deliberate dark hero regardless of site theme — text stays white on purpose. */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[58%] relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('/login-hero.jpg')", filter: 'blur(1.5px) brightness(0.85)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-[#0A1A28]/80" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-h-blue flex items-center justify-center shadow-lg">
            <Cross className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Kigali Health Network</p>
            <p className="text-white/50 text-xs">KUPRIN — Unified Patient Records</p>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-h-red" fill="currentColor" />
            <span className="text-white/60 text-sm font-medium uppercase tracking-widest">Healthcare Platform</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            One city.<br />Every patient.<br />One secure<br />network.
          </h2>
          <p className="text-white/65 text-base max-w-sm leading-relaxed">
            A permissioned, interoperable health data platform connecting
            clinics, hospitals, pharmacies and insurance providers across Kigali, Rwanda.
          </p>

          <div className="flex flex-wrap gap-2 mt-8">
            {['Consent-First','RBAC Security','Real-Time Events','Full Audit Trail'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 bg-white/10 border border-white/15">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs relative">
          © 2026 Kigali Unified Patient Records & Insurance Network<br />
          ALU Enterprise Systems Project · BSc. Software Engineering
        </p>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden" style={{ backgroundColor: 'rgb(var(--color-h-bg))' }}>
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <ThemeToggle />
        </div>
        <div className="relative lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-h-blue flex items-center justify-center">
            <Cross className="w-4.5 h-4.5 text-white" strokeWidth={3} />
          </div>
          <span className="font-bold text-h-text">Kigali Health Network</span>
        </div>

        <div className="relative w-full max-w-[380px]">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-h-text mb-1">Sign in</h1>
            <p className="text-sm text-h-text-muted">Access your KUPRIN dashboard</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3.5 py-3 bg-h-red-light border border-h-red/20 rounded-xl text-h-red text-sm mb-4 animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-h-text mb-1.5" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-h-text-light" />
                <input id="email" type="email" autoComplete="email"
                  placeholder="you@kuprin.rw"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-h-text mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-h-text-light" />
                <input id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-h-text-light hover:text-h-text">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-h-blue text-white text-sm font-semibold shadow-btn hover:bg-h-blue-dark active:scale-[0.98] transition-all duration-200 disabled:opacity-60 mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                : <><LogIn className="w-4 h-4" />Sign in</>
              }
            </button>
          </form>

          <div className="mt-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-h-border" />
              <span className="text-xs font-medium text-h-text-light px-1">Demo accounts</span>
              <div className="flex-1 h-px bg-h-border" />
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_DEMO.map(demo => {
                const u = DEMO_USERS.find(d => d.id === demo.userId);
                if (!u) return null;
                const accent = ROLE_ACCENT[u.role];
                return (
                  <button
                    key={demo.userId}
                    onClick={() => handleDemo(demo.userId)}
                    disabled={!!demoLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 disabled:opacity-50"
                    style={{
                      borderColor: demoLoading === demo.userId ? accent : 'rgb(var(--color-h-border))',
                      color: demoLoading === demo.userId ? accent : 'rgb(var(--color-h-text-muted))',
                      backgroundColor: demoLoading === demo.userId ? `${accent}0F` : 'transparent',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; e.currentTarget.style.backgroundColor = `${accent}0F`; }}
                    onMouseLeave={e => { if (demoLoading !== demo.userId) { e.currentTarget.style.borderColor = 'rgb(var(--color-h-border))'; e.currentTarget.style.color = 'rgb(var(--color-h-text-muted))'; e.currentTarget.style.backgroundColor = 'transparent'; }}}
                  >
                    {demoLoading === demo.userId && (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    {demo.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-h-text-light mt-3">Click any demo role to sign in instantly — no password needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}