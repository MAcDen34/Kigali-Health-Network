import { useState } from 'react'
import { Pill, AlertTriangle, CheckCircle2, Search } from 'lucide-react'
import AppShell from '../layouts/AppShell'
import { Card, Badge, SectionHeading, StatTile } from '../components/Primitives'
import { useAuth } from '../context/AuthContext'
import { prescriptions } from '../data/mockData'

const FLAG_LABEL = {
  interaction: { label: 'Drug interaction risk', tone: 'danger' },
  allergy: { label: 'Allergy conflict', tone: 'danger' },
}

export default function PharmacyDashboard() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [list, setList] = useState(prescriptions)

  const filtered = list.filter(rx =>
    rx.patient.toLowerCase().includes(query.toLowerCase()) ||
    rx.code.toLowerCase().includes(query.toLowerCase()) ||
    rx.drug.toLowerCase().includes(query.toLowerCase())
  )

  const dispense = (id) => {
    setList(prev => prev.map(rx => rx.id === id ? { ...rx, status: 'dispensed' } : rx))
  }

  const flaggedCount = list.filter(rx => rx.flag).length

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-accent)] mb-1">Pharmacy Service</p>
          <h1 className="font-[var(--font-display)] text-2xl md:text-3xl font-semibold text-[var(--color-text)]">
            Pharmacy Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{user?.institution}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Prescriptions today" value={list.length} tone="brand" />
          <StatTile label="Flagged" value={flaggedCount} tone="danger" />
          <StatTile label="Dispensed" value={list.filter(r => r.status === 'dispensed').length} tone="success" />
          <StatTile label="Pending" value={list.filter(r => r.status !== 'dispensed').length} tone="neutral" />
        </div>

        <Card>
          <SectionHeading
            title="Prescription queue"
            eyebrow="Real-time event feed via Redis Pub/Sub"
          />
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient, drug, or prescription code..."
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-faint"
            />
          </div>

          <div className="space-y-2.5">
            {filtered.map(rx => {
              const flagInfo = rx.flag ? FLAG_LABEL[rx.flag] : null
              return (
                <div
                  key={rx.id}
                  className={`rounded-lg border px-4 py-3.5 ${
                    rx.flag ? 'border-[var(--color-danger)]/30 bg-[color-mix(in_srgb,var(--color-danger)_5%,transparent)]' : 'border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                        flagInfo ? 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]' : 'bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]'
                      }`}>
                        {flagInfo ? <AlertTriangle size={16} /> : <Pill size={16} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[var(--color-text)]">{rx.drug}</p>
                          <span className="text-xs font-[var(--font-mono)] text-faint">{rx.code}</span>
                        </div>
                        <p className="text-xs text-faint mt-0.5">
                          {rx.patient} · {rx.dosage} · prescribed by {rx.doctor} · {rx.date}
                        </p>
                        {flagInfo && (
                          <Badge tone="danger" className="mt-2">{flagInfo.label}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rx.status === 'dispensed' ? (
                        <Badge tone="success">
                          <CheckCircle2 size={12} /> Dispensed
                        </Badge>
                      ) : (
                        <button
                          onClick={() => dispense(rx.id)}
                          className="rounded-full bg-[var(--color-brand)] text-white text-xs font-semibold px-3.5 py-2 hover:bg-[var(--color-brand-strong)] transition-colors"
                        >
                          Mark dispensed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-faint text-center py-8">No prescriptions match your search.</p>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
