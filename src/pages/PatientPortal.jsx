import { useState } from 'react'
import { ShieldCheck, ShieldOff, Clock3, AlertTriangle, FileText, Pill } from 'lucide-react'
import AppShell from '../layouts/AppShell'
import { Card, Badge, SectionHeading, StatTile } from '../components/Primitives'
import { patientRecord, consentGrants, auditLog, medicalHistory } from '../data/mockData'

export default function PatientPortal() {
  const [consents, setConsents] = useState(consentGrants)

  const toggleConsent = (id) => {
    setConsents(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'revoked' : 'active' } : c
    ))
  }

  const activeCount = consents.filter(c => c.status === 'active').length

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-accent)] mb-1">My Records</p>
          <h1 className="font-[var(--font-display)] text-2xl md:text-3xl font-semibold text-[var(--color-text)]">
            Welcome back, {patientRecord.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            You control who can view your medical history. Every access is logged below.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Active consents" value={activeCount} tone="brand" />
          <StatTile label="Blood group" value={patientRecord.bloodGroup} tone="neutral" />
          <StatTile label="Allergies on file" value={patientRecord.allergies.length} tone="warning" />
          <StatTile label="Record entries" value={medicalHistory.length} tone="success" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile + allergies */}
          <Card className="md:col-span-1 h-fit">
            <SectionHeading title="Profile" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-faint">Date of birth</dt>
                <dd className="font-medium text-[var(--color-text)]">{patientRecord.dob}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">National ID</dt>
                <dd className="font-medium text-[var(--color-text)] font-[var(--font-mono)] text-xs">{patientRecord.nationalId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-faint">Phone</dt>
                <dd className="font-medium text-[var(--color-text)]">{patientRecord.phone}</dd>
              </div>
            </dl>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-[var(--color-warning)]" /> Allergies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {patientRecord.allergies.map(a => (
                  <Badge key={a} tone="warning">{a}</Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Consent management */}
          <Card className="md:col-span-2">
            <SectionHeading
              title="Consent management"
              action={<span className="text-xs text-faint">Grant or revoke access instantly</span>}
            />
            <div className="space-y-2.5">
              {consents.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3.5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      c.status === 'active' ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]' : 'bg-[var(--color-surface-alt)] text-faint'
                    }`}>
                      {c.status === 'active' ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{c.institution}</p>
                      <p className="text-xs text-faint">Granted {c.grantedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge tone={c.status === 'active' ? 'success' : 'neutral'}>
                      {c.status === 'active' ? 'Active' : 'Revoked'}
                    </Badge>
                    <button
                      onClick={() => toggleConsent(c.id)}
                      className="text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-strong)] transition-colors"
                    >
                      {c.status === 'active' ? 'Revoke' : 'Re-grant'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Medical history */}
        <Card>
          <SectionHeading title="Medical history" eyebrow="Records & Consent Service" />
          <div className="space-y-2.5">
            {medicalHistory.map(m => (
              <div key={m.id} className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] px-3.5 py-3">
                <div className="h-8 w-8 rounded-full bg-[var(--color-surface-alt)] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={14} className="text-[var(--color-text-muted)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="brand">{m.type}</Badge>
                    <span className="text-xs text-faint">{m.date}</span>
                  </div>
                  <p className="text-sm text-[var(--color-text)] mt-1">{m.detail}</p>
                  <p className="text-xs text-faint mt-0.5">{m.institution} · {m.doctor}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Audit log */}
        <Card>
          <SectionHeading title="Access audit log" eyebrow="Who has viewed your data" />
          <div className="space-y-2">
            {auditLog.map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-[var(--color-border)] last:border-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock3 size={13} className="text-faint shrink-0" />
                  <span className="text-[var(--color-text)] font-medium truncate">{a.actor}</span>
                  <span className="text-faint truncate hidden sm:inline">— {a.action}</span>
                </div>
                <span className="text-xs text-faint shrink-0 ml-3">{a.timestamp}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
