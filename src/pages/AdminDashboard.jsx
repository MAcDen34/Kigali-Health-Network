import { useState } from 'react'
import { Building2, KeyRound, Activity, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import AppShell from '../layouts/AppShell'
import { Card, Badge, SectionHeading, StatTile } from '../components/Primitives'
import { institutions, systemHealth, platformAudit } from '../data/mockData'

export default function AdminDashboard() {
  const [tab, setTab] = useState('institutions')

  const healthyCount = systemHealth.filter(s => s.status === 'healthy').length

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-accent)] mb-1">Admin & Platform Service</p>
            <h1 className="font-[var(--font-display)] text-2xl md:text-3xl font-semibold text-[var(--color-text)]">
              Platform Administration
            </h1>
          </div>
          <button className="flex items-center gap-1.5 rounded-full bg-[var(--color-brand)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-brand-strong)] transition-colors">
            <Plus size={15} /> Onboard institution
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Institutions" value={institutions.length} tone="brand" />
          <StatTile label="Services healthy" value={`${healthyCount}/${systemHealth.length}`} tone={healthyCount === systemHealth.length ? 'success' : 'warning'} />
          <StatTile label="Pending onboarding" value={institutions.filter(i => i.status === 'pending').length} tone="warning" />
          <StatTile label="Audit events today" value={platformAudit.length} tone="neutral" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--color-border)]">
          {[
            { key: 'institutions', label: 'Institutions' },
            { key: 'health', label: 'System health' },
            { key: 'audit', label: 'Platform audit' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                  : 'border-transparent text-faint hover:text-[var(--color-text)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'institutions' && (
          <Card>
            <SectionHeading title="Registered institutions" eyebrow="Per-institution API tokens" />
            <div className="space-y-2.5">
              {institutions.map(inst => (
                <div key={inst.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3.5 flex-wrap gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)] flex items-center justify-center shrink-0">
                      <Building2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{inst.name}</p>
                      <p className="text-xs text-faint">{inst.type} · {inst.staff} staff · joined {inst.joined}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge tone={inst.status === 'active' ? 'success' : 'warning'}>
                      {inst.status === 'active' ? 'Active' : 'Pending review'}
                    </Badge>
                    <button className="flex items-center gap-1 text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-strong)]">
                      <KeyRound size={12} /> Manage token
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'health' && (
          <Card>
            <SectionHeading title="Service health" eyebrow="HAProxy-routed microservices" />
            <div className="space-y-2.5">
              {systemHealth.map(s => (
                <div key={s.service} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      s.status === 'healthy' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{s.service}</p>
                      <p className="text-xs text-faint font-[var(--font-mono)]">:{s.port}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-faint">{s.latency}ms avg</span>
                    <Badge tone={s.status === 'healthy' ? 'success' : 'warning'}>
                      {s.status === 'healthy' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                      {s.status === 'healthy' ? 'Healthy' : 'Degraded'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'audit' && (
          <Card>
            <SectionHeading title="Platform-wide audit trail" eyebrow="Immutable · all institutions" />
            <div className="space-y-2">
              {platformAudit.map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm py-2.5 border-b border-[var(--color-border)] last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Activity size={13} className="text-faint shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[var(--color-text)] truncate">
                        <span className="font-medium">{a.actor}</span>
                        <span className="text-faint"> — {a.action}</span>
                      </p>
                      <p className="text-xs text-faint">{a.institution}</p>
                    </div>
                  </div>
                  <span className="text-xs text-faint shrink-0 ml-3">{a.timestamp}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
