import { useState } from 'react'
import { Users, AlertCircle, ShieldCheck, ShieldOff, Plus, X, Activity } from 'lucide-react'
import AppShell from '../layouts/AppShell'
import { Card, Badge, SectionHeading, StatTile } from '../components/Primitives'
import { useAuth } from '../context/AuthContext'
import { clinicalPatients, medicalHistory, prescriptions } from '../data/mockData'

export default function ClinicDashboard() {
  const { user } = useAuth()
  const [selected, setSelected] = useState(clinicalPatients[0])
  const [showForm, setShowForm] = useState(false)
  const isNurse = user?.role === 'nurse'

  const patientPrescriptions = prescriptions.filter(p => p.patient === selected.name)
  const patientHistory = medicalHistory.slice(0, selected.consent ? 3 : 0)

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-accent)] mb-1">
              {isNurse ? 'Nurse Station' : 'Clinical Service'}
            </p>
            <h1 className="font-[var(--font-display)] text-2xl md:text-3xl font-semibold text-[var(--color-text)]">
              Clinic Dashboard
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{user?.institution}</p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-brand)] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[var(--color-brand-strong)] transition-colors"
          >
            <Plus size={15} /> {isNurse ? 'Record vitals' : 'New diagnosis'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Patients today" value={clinicalPatients.length} tone="brand" />
          <StatTile label="Consent active" value={clinicalPatients.filter(p => p.consent).length} tone="success" />
          <StatTile label="Interaction flags" value={1} tone="warning" />
          <StatTile label="Prescriptions issued" value={prescriptions.length} tone="neutral" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Patient list */}
          <Card className="md:col-span-1 p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2">
              <Users size={15} className="text-[var(--color-text-muted)]" />
              <p className="text-sm font-semibold text-[var(--color-text)]">Patients</p>
            </div>
            <div className="divide-y divide-[var(--color-border)] max-h-[480px] overflow-y-auto">
              {clinicalPatients.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    selected.id === p.id ? 'bg-[var(--color-brand-soft)]' : 'hover:bg-[var(--color-surface-alt)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--color-text)]">{p.name}</p>
                    {p.alerts > 0 && <AlertCircle size={14} className="text-[var(--color-warning)]" />}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-faint">Age {p.age} · {p.lastVisit}</span>
                    {p.consent ? (
                      <ShieldCheck size={13} className="text-[var(--color-success)]" />
                    ) : (
                      <ShieldOff size={13} className="text-faint" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Selected patient detail */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-text)]">{selected.name}</h3>
                <Badge tone={selected.consent ? 'success' : 'danger'}>
                  {selected.consent ? 'Consent granted' : 'No consent'}
                </Badge>
              </div>
              <p className="text-xs text-faint mb-4">Age {selected.age} · Last visit {selected.lastVisit}</p>

              {!selected.consent ? (
                <div className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-6 text-center">
                  <ShieldOff size={20} className="mx-auto text-faint mb-2" />
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Access blocked — this patient has not granted consent to {user?.institution}.
                  </p>
                  <p className="text-xs text-faint mt-1">An emergency override is available and will be logged & flagged for audit.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {patientHistory.map(m => (
                    <div key={m.id} className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] px-3.5 py-3">
                      <Activity size={14} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge tone="brand">{m.type}</Badge>
                          <span className="text-xs text-faint">{m.date}</span>
                        </div>
                        <p className="text-sm text-[var(--color-text)] mt-1">{m.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {selected.consent && patientPrescriptions.length > 0 && (
              <Card>
                <SectionHeading title="Prescriptions" eyebrow="Pharmacy Service sync" />
                <div className="space-y-2">
                  {patientPrescriptions.map(rx => (
                    <div key={rx.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3.5 py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text)]">{rx.drug}</p>
                        <p className="text-xs text-faint">{rx.dosage} · {rx.code}</p>
                      </div>
                      {rx.flag ? (
                        <Badge tone="danger">{rx.flag === 'interaction' ? 'Interaction risk' : 'Allergy conflict'}</Badge>
                      ) : (
                        <Badge tone="success">Clear</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-30" onClick={() => setShowForm(false)}>
            <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-text)]">
                  {isNurse ? 'Record vitals' : 'New diagnosis entry'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-faint hover:text-[var(--color-text)]">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Patient</label>
                  <select className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]">
                    {clinicalPatients.map(p => <option key={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">
                    {isNurse ? 'Blood pressure / HR / Temp' : 'Diagnosis'}
                  </label>
                  <input
                    type="text"
                    placeholder={isNurse ? 'e.g. 120/80, 72bpm, 36.6°C' : 'e.g. Type 2 Diabetes Mellitus'}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-faint"
                  />
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-full rounded-full bg-[var(--color-brand)] text-white text-sm font-semibold py-2.5 hover:bg-[var(--color-brand-strong)] transition-colors mt-2"
                >
                  Save entry
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  )
}
