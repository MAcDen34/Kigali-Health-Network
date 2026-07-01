import { useState } from 'react'
import { FileStack, Clock3, CheckCircle2, XCircle, Banknote } from 'lucide-react'
import AppShell from '../layouts/AppShell'
import { Card, Badge, SectionHeading, StatTile } from '../components/Primitives'
import { useAuth } from '../context/AuthContext'
import { claims } from '../data/mockData'

const STATUS_TONE = {
  pending: 'warning',
  approved: 'brand',
  paid: 'success',
  rejected: 'danger',
}

const STATUS_ICON = {
  pending: Clock3,
  approved: CheckCircle2,
  paid: Banknote,
  rejected: XCircle,
}

export default function InsuranceDashboard() {
  const { user } = useAuth()
  const [list, setList] = useState(claims)

  const updateStatus = (id, status) => {
    setList(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const totalPending = list.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0)

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-accent)] mb-1">Insurance Service</p>
          <h1 className="font-[var(--font-display)] text-2xl md:text-3xl font-semibold text-[var(--color-text)]">
            Claims & Coverage
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{user?.institution}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Total claims" value={list.length} tone="brand" />
          <StatTile label="Pending" value={list.filter(c => c.status === 'pending').length} tone="warning" />
          <StatTile label="Paid" value={list.filter(c => c.status === 'paid').length} tone="success" />
          <StatTile label="Pending value" value={`RWF ${totalPending.toLocaleString()}`} tone="neutral" />
        </div>

        <Card>
          <SectionHeading
            title="Claims queue"
            eyebrow="Billing-relevant data only — no clinical detail exposed"
          />
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs text-faint uppercase tracking-wide border-b border-[var(--color-border)]">
                  <th className="px-5 py-2.5 font-medium">Claim</th>
                  <th className="px-2 py-2.5 font-medium">Patient</th>
                  <th className="px-2 py-2.5 font-medium">Institution</th>
                  <th className="px-2 py-2.5 font-medium">Diagnosis code</th>
                  <th className="px-2 py-2.5 font-medium">Amount</th>
                  <th className="px-2 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map(c => {
                  const Icon = STATUS_ICON[c.status]
                  return (
                    <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="px-5 py-3 font-[var(--font-mono)] text-xs text-[var(--color-text)]">{c.id}</td>
                      <td className="px-2 py-3 text-[var(--color-text)]">{c.patient}</td>
                      <td className="px-2 py-3 text-faint text-xs">{c.institution}</td>
                      <td className="px-2 py-3 font-[var(--font-mono)] text-xs text-faint">{c.diagnosisCode}</td>
                      <td className="px-2 py-3 text-[var(--color-text)]">RWF {c.amount.toLocaleString()}</td>
                      <td className="px-2 py-3">
                        <Badge tone={STATUS_TONE[c.status]}>
                          <Icon size={11} />
                          {c.status[0].toUpperCase() + c.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {c.status === 'pending' && (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => updateStatus(c.id, 'approved')}
                              className="text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-strong)]"
                            >
                              Approve
                            </button>
                            <span className="text-faint">·</span>
                            <button
                              onClick={() => updateStatus(c.id, 'rejected')}
                              className="text-xs font-semibold text-[var(--color-danger)] hover:opacity-80"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {c.status === 'approved' && (
                          <button
                            onClick={() => updateStatus(c.id, 'paid')}
                            className="text-xs font-semibold text-[var(--color-success)] hover:opacity-80"
                          >
                            Mark paid
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
