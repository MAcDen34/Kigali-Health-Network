'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ROLE_ACCENT } from '@/data/roles';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import KPICard from '@/components/ui/KPICard';
import { ShieldCheck, ShieldOff, AlertTriangle, Search, Plus, Activity, Pill, X, Loader2 } from 'lucide-react';
import { getPatientDiagnoses, getPatientVitals, getPatientPrescriptions, createDiagnosis, recordVitals } from '@/lib/api';

export default function ClinicPage() {
  const { state } = useApp();
  // NOTE: clinicPatients still comes from mockData.js — the Records Service
  // has no "list all patients" endpoint yet, only create-one and get-by-id.
  // Once that endpoint exists, this list is the piece to swap over.
  const { user, clinicPatients, prescriptions: mockPrescriptions } = state;
  const isNurse = user?.role === 'NURSE';
  const accent = ROLE_ACCENT[user?.role] || '#5A8AA6';

  // --- Deep-link support (from teammate's header-search feature) ---
  const searchParams = useSearchParams();
  const patientParam = searchParams.get('patient');
  const [selected, setSelected] = useState(() =>
    clinicPatients.find(p => p.name === patientParam) || clinicPatients[0]
  );
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    if (!patientParam) return;
    const match = clinicPatients.find(p => p.name === patientParam);
    if (!match) return;
    setSelected(match);
    setHighlightId(match.id);
    requestAnimationFrame(() => {
      document.getElementById(`patient-row-${match.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const t = setTimeout(() => setHighlightId(null), 2200);
    return () => clearTimeout(t);
  }, [patientParam, clinicPatients]);

  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ detail: '', type: isNurse ? 'Vitals' : 'Diagnosis' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // --- Live clinical data (from my API-wiring feature) ---
  const [clinical, setClinical] = useState({ diagnoses: [], vitals: [], prescriptions: [] });
  const [loadingClinical, setLoadingClinical] = useState(false);
  const [clinicalError, setClinicalError] = useState('');

  async function loadClinicalData(patient) {
    if (!patient?.consent) {
      setClinical({ diagnoses: [], vitals: [], prescriptions: [] });
      setClinicalError('');
      return;
    }
    setLoadingClinical(true);
    setClinicalError('');
    try {
      const [diagnoses, vitals, prescriptions] = await Promise.all([
        getPatientDiagnoses(patient.id),
        getPatientVitals(patient.id),
        getPatientPrescriptions(patient.id),
      ]);
      setClinical({ diagnoses, vitals, prescriptions });
    } catch (err) {
      // Expected for now: mock patient IDs (e.g. "P1") don't exist in the real
      // database yet, so this will 404/422 until real patients are seeded.
      setClinicalError(err.message);
      setClinical({ diagnoses: [], vitals: [], prescriptions: [] });
    } finally {
      setLoadingClinical(false);
    }
  }

  useEffect(() => {
    loadClinicalData(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const filtered = clinicPatients.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  const consented = clinicPatients.filter(p => p.consent).length;
  const flagged = mockPrescriptions.filter(p => p.flag).length;

  const handleSave = async () => {
    if (!form.detail.trim() || !selected) return;
    setSaving(true);
    setSaveError('');
    try {
      if (isNurse) {
        await recordVitals({ patient_id: selected.id, notes: form.detail });
      } else if (form.type === 'Diagnosis') {
        await createDiagnosis({ patient_id: selected.id, description: form.detail });
      } else {
        // Lab Result — no dedicated Clinical Service endpoint yet, so it's
        // logged as a diagnosis note for now. Flag this for the backend team
        // if a distinct lab-results endpoint is needed later.
        await createDiagnosis({ patient_id: selected.id, description: `[Lab Result] ${form.detail}` });
      }
      await loadClinicalData(selected);
      setModal(false);
      setForm({ detail: '', type: isNurse ? 'Vitals' : 'Diagnosis' });
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Patients today"    value={clinicPatients.length} icon="Users"         color="blue"  />
        <KPICard title="Consent active"    value={consented}             icon="ShieldCheck"   color="teal"  />
        <KPICard title="Prescriptions"     value={mockPrescriptions.length} icon="Pill"        color="green" />
        <KPICard title="Flags"             value={flagged}               icon="AlertTriangle" color="amber" />
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        {/* Patient list */}
        <div className="card overflow-hidden">
          <div className="p-3.5 border-b border-h-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-h-text-light" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search patients…"
                style={searchFocused ? { borderColor:accent, boxShadow:`0 0 0 3px ${accent}25` } : {}}
                className="w-full pl-8 pr-3 py-2 text-sm bg-h-bg border border-h-border rounded-xl focus:outline-none transition-colors placeholder:text-h-text-light" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[480px] scrollbar-thin divide-y divide-h-border">
            {filtered.map(p => (
              <button key={p.id} id={`patient-row-${p.id}`} onClick={() => setSelected(p)}
                className={`w-full text-left px-4 py-3.5 transition-colors duration-700 ${
                  highlightId === p.id ? 'bg-h-bg' : selected?.id === p.id ? 'bg-h-blue-light' : 'hover:bg-h-bg'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-h-text truncate">{p.name}</p>
                  {p.alerts > 0 && <AlertTriangle className="w-3.5 h-3.5 text-h-amber flex-shrink-0" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-h-text-muted">Age {p.age} · {p.lastVisit}</span>
                  {p.consent
                    ? <ShieldCheck className="w-3.5 h-3.5 text-h-green" />
                    : <ShieldOff className="w-3.5 h-3.5 text-h-text-light" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Patient detail */}
        {selected && (
          <div className="space-y-4">
            {/* Header */}
            <div className="card p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-h-blue-light text-h-blue text-sm font-bold flex items-center justify-center">
                    {selected.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-h-text text-base">{selected.name}</h3>
                    <p className="text-xs text-h-text-muted">Age {selected.age} · Blood group {selected.bloodGroup} · Last visit {selected.lastVisit}</p>
                    {selected.diagnosis !== '—' && <p className="text-xs text-h-blue mt-0.5">{selected.diagnosis}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={selected.consent ? 'green' : 'red'}>
                    {selected.consent ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                    {selected.consent ? 'Consent granted' : 'No consent'}
                  </Badge>
                  <button onClick={() => setModal(true)}
                    className="btn-primary text-xs py-2 px-3.5">
                    <Plus className="w-3.5 h-3.5" />
                    {isNurse ? 'Record vitals' : 'New entry'}
                  </button>
                </div>
              </div>
            </div>

            {!selected.consent ? (
              <div className="card p-8 text-center">
                <ShieldOff className="w-10 h-10 text-h-text-light mx-auto mb-3" />
                <p className="font-semibold text-h-text mb-1">Access blocked</p>
                <p className="text-sm text-h-text-muted max-w-sm mx-auto">
                  {selected.name} has not granted consent to {user?.institution}.
                  An emergency override is available and will be logged for audit.
                </p>
                <button className="btn-secondary mt-4 text-xs text-h-red border-h-red/30 hover:bg-h-red-light">
                  Emergency override (logged)
                </button>
              </div>
            ) : (
              <>
                {loadingClinical && (
                  <div className="card p-5 flex items-center gap-2 text-sm text-h-text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading clinical data…
                  </div>
                )}

                {!loadingClinical && clinicalError && (
                  <div className="card p-5 border border-h-red/20 bg-h-red-light/40">
                    <p className="text-sm font-semibold text-h-red mb-1">Couldn't load live data</p>
                    <p className="text-xs text-h-text-muted">{clinicalError}</p>
                    <p className="text-[11px] text-h-text-light mt-2">
                      Expected until this patient exists in the real database — the sidebar list is still demo data.
                    </p>
                  </div>
                )}

                {!loadingClinical && !clinicalError && (
                  <>
                    {/* History */}
                    <div className="card p-5">
                      <h4 className="section-title">Medical history</h4>
                      <div className="space-y-2.5">
                        {clinical.diagnoses.length === 0 && (
                          <p className="text-sm text-h-text-muted">No diagnoses recorded yet.</p>
                        )}
                        {clinical.diagnoses.map(m => (
                          <div key={m.id} className="flex items-start gap-3 rounded-xl border border-h-border px-3.5 py-3">
                            <Activity className="w-4 h-4 text-h-text-muted mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Badge tone="blue">Diagnosis</Badge>
                                <span className="text-xs text-h-text-muted">
                                  {new Date(m.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-h-text">{m.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prescriptions */}
                    {clinical.prescriptions.length > 0 && (
                      <div className="card p-5">
                        <h4 className="section-title">Prescriptions</h4>
                        <div className="space-y-2">
                          {clinical.prescriptions.map(rx => (
                            <div key={rx.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${rx.flag ? 'border-h-red/25 bg-h-red-light/40' : 'border-h-border'}`}>
                              <div>
                                <p className="text-sm font-semibold text-h-text">{rx.drug_name}</p>
                                <p className="text-xs text-h-text-muted">{rx.dosage} · {rx.drug_code}</p>
                              </div>
                              {rx.flag
                                ? <Badge tone="red"><AlertTriangle className="w-3 h-3" />{rx.flag === 'interaction' ? 'Drug interaction' : 'Allergy conflict'}</Badge>
                                : <Badge tone="green">Clear</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* New entry modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={isNurse ? 'Record vitals' : 'New clinical entry'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">Patient</label>
            <input className="input-field bg-h-bg text-h-text-muted" value={selected?.name || ''} disabled readOnly />
          </div>
          {!isNurse && (
            <div>
              <label className="block text-xs font-semibold text-h-text mb-1.5">Entry type</label>
              <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option>Diagnosis</option><option>Lab Result</option><option>Vitals</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">
              {isNurse ? 'Vitals (BP / HR / Temp)' : 'Details'}
            </label>
            <textarea rows={3}
              placeholder={isNurse ? 'e.g. BP 120/80 · HR 72 bpm · Temp 36.6°C' : 'Describe the diagnosis or finding…'}
              value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))}
              className="input-field resize-none" />
          </div>
          {saveError && (
            <p className="text-xs text-h-red">{saveError}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</> : 'Save entry'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}