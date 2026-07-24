'use client';
import { useApp } from '@/context/AppContext';
import { ROLES, ROLE_ACCENT } from '@/data/roles';
import { Mail, Building2, IdCard, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { state } = useApp();
  const { user } = state;
  if (!user) return null;
  const accent = ROLE_ACCENT[user.role] || '#5A8AA6';

  const fields = [
    { label:'Email address', value:user.email,             icon:Mail },
    { label:'Institution',   value:user.institution || '—', icon:Building2 },
    { label:'Account ID',    value:user.id,                 icon:IdCard },
    { label:'Role',          value:ROLES[user.role],        icon:ShieldCheck },
  ];

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="card p-6">
        <div className="flex items-center gap-4 pb-5 mb-5 border-b border-h-border">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: accent }}>
            {user.avatar}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-h-text truncate">{user.name}</h2>
            <p className="text-sm font-medium" style={{ color: accent }}>{ROLES[user.role]}</p>
          </div>
        </div>
        <dl className="space-y-4">
          {fields.map(({ label, value, icon:Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-h-bg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-h-text-muted" />
              </div>
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-h-text-light">{label}</dt>
                <dd className="text-sm font-medium text-h-text truncate">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
      <p className="text-xs text-h-text-light mt-4">
        This is a read-only summary — account details are managed by your institution&rsquo;s administrator.
      </p>
    </div>
  );
}
