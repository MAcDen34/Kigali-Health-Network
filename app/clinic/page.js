'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ROLE_ACCENT } from '@/data/roles';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import KPICard from '@/components/ui/KPICard';
import { ShieldCheck, ShieldOff, AlertTriangle, Search, Plus, Activity, Pill, X } from 'lucide-react';
import {
  listPatients, checkConsent, listPatientDiagnoses, listPatientVitals,
  createDiagnosis, createVitals, listPatientPrescriptions,
} from '@/lib/api';
 
function vitalsDetail(v) {
  const parts = [];
  if (v.blood_pressure) parts.push(`BP ${v.blood_pressure}`);
  if (v.heart_rate) parts.push(`HR ${v.heart_rate}`);
  if (v.temperature) parts.push(`Temp ${v.temperature}`);
  if (v.oxygen_sat) parts.push(`O2 ${v.oxygen_sat}`);
  return parts.length > 0 ? parts.join(' · ') : (v.notes || '—');
}
 
export default function ClinicPage() {
  const { state } = useApp();
  const { user } = state;
  const isNurse = user?.role === 'NURSE';
  const accent = ROLE_ACCENT[user?.role] || '#5A8AA6';
  const searchParams = useSearchParams();
  const patientParam = searchParams.get('patient');
 
  const [patients, setPatients] = useState([]);
  const [consentMap, setConsentMap] = useState({});
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ detail: '' });
  const [refreshKey, setRefreshKey] = useState(0); // bump this to re-trigger the guarded fetch below — the ONLY place history/prescriptions get fetched
 
  // Load the patient list, then check this institution's consent status for each.
  useEffect(() => {
    if (!user?.token || !user?.institutionId) return;
    listPatients()
      .then(async (list) => {
        setPatients(list);
        const entries = await Promise.all(
          list.map(async (p) => {
            const consent = await checkConsent(p.id, user.institutionId, user.token).catch(() => null);
            return [p.id, consent];
          })
        );
        setConsentMap(Object.fromEntries(entries));
        setSelected(list[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [user?.token, user?.institutionId]);
 
  // Deep-linked from header search: select by name, scroll into view, flash.
  useEffect(() => {
    if (!patientParam || patients.length === 0) return;
    const match = patients.find(p => p.full_name === patientParam);
    if (!match) return;
    setSelected(match);
    setHighlightId(match.id);
    requestAnimationFrame(() => {
      document.getElementById(`patient-row-${match.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const t = setTimeout(() => setHighlightId(null), 2200);
    return () => clearTimeout(t);
  }, [patientParam, patients]);
 
  // THE ONLY place that fetches a patient's clinical history + prescriptions.
  // Guarded against race conditions: if `selected` (or refreshKey) changes again
  // before this finishes, `cancelled` becomes true and the stale result is discarded.
  useEffect(() => {
    if (!selected || !consentMap[selected.id] || !user?.token) {
      setHistory([]);
      setPrescriptions([]);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    Promise.all([
      listPatientDiagnoses(selected.id, user.token),
      listPatientVitals(selected.id, user.token),
      listPatientPrescriptions(selected.id),
    ])
      .then(([diagnoses, vitals, rx]) => {
        if (cancelled) return;
        const merged = [
          ...diagnoses.map(d => ({ id: d.id, type: 'Diagnosis', date: d.created_at, detail: d.description })),
          ...vitals.map(v => ({ id: v.id, type: 'Vitals', date: v.recorded_at, detail: vitalsDetail(v) })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(merged);
        setPrescriptions(rx);
        setDetailLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setHistory([]);
        setPrescriptions([]);
        setDetailLoading(false);
      });
    return () => { cancelled = true; };
  }, [selected, consentMap, user?.token, refreshKey]);
 
  const filtered = patients.filter(p =>
    (p.full_name || '').toLowerCase().includes(query.toLowerCase())
  );
  const consented = patients.filter(p => consentMap[p.id]).length;
 
  const handleSave = async () => {
    if (!form.detail.trim() || !selected) return;
    try {
      if (isNurse) {
        await createVitals({ patient_id: selected.id, notes: form.detail }, user.token);
      } else {
        await createDiagnosis({ patient_id: selected.id, description: form.detail }, user.token);
      }
      setModal(false);
      setForm({ detail: '' });
      setRefreshKey(k => k + 1); // re-triggers the single guarded fetch above — no duplicate logic
    } catch (err) {
      setError(err.message);
    }
  };
 
  if (loading) return <p className="text-sm text-h-text-muted">Loading clinic data...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;
 
  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Patients today"    value={patients.length}      icon="Users"         color="blue"  />
        <KPICard title="Consent active"    value={consented}            icon="ShieldCheck"   color="teal"  />
        <KPICard title="Prescriptions"     value={prescriptions.length} icon="Pill"          color="green" />
        <KPICard title="Flags"             value={0}                    icon="AlertTriangle" color="amber" />
      </div>
 
      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
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
                  <p className="text-sm font-semibold text-h-text truncate">{p.full_name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-h-text-muted">DOB {p.dob}</span>
                  {consentMap[p.id]
                    ? <ShieldCheck className="w-3.5 h-3.5 text-h-green" />
                    : <ShieldOff className="w-3.5 h-3.5 text-h-text-light" />}
                </div>
              </button>
            ))}
          </div>
        </div>
 
        {selected && (
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-h-blue-light text-h-blue text-sm font-bold flex items-center justify-center">
                    {(selected.full_name || '?').split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-h-text text-base">{selected.full_name}</h3>
                    <p className="text-xs text-h-text-muted">DOB {selected.dob} · Blood group {selected.blood_group}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={consentMap[selected.id] ? 'green' : 'red'}>
                    {consentMap[selected.id] ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                    {consentMap[selected.id] ? 'Consent granted' : 'No consent'}
                  </Badge>
                  {consentMap[selected.id] && (
                    <button onClick={() => setModal(true)}
                      className="btn-primary text-xs py-2 px-3.5">
                      <Plus className="w-3.5 h-3.5" />
                      {isNurse ? 'Record vitals' : 'New entry'}
                    </button>
                  )}
                </div>
              </div>
            </div>
 
            {!consentMap[selected.id] ? (
              <div className="card p-8 text-center">
                <ShieldOff className="w-10 h-10 text-h-text-light mx-auto mb-3" />
                <p className="font-semibold text-h-text mb-1">Access blocked</p>
                <p className="text-sm text-h-text-muted max-w-sm mx-auto">
                  {selected.full_name} has not granted consent to {user?.institution}.
                </p>
              </div>
            ) : detailLoading ? (
              <div className="card p-5"><p className="text-sm text-h-text-muted">Loading patient data...</p></div>
            ) : (
              <>
                <div className="card p-5">
                  <h4 className="section-title">Medical history</h4>
                  <div className="space-y-2.5">
                    {history.length === 0 && <p className="text-sm text-h-text-muted">No clinical entries yet.</p>}
                    {history.slice(0, 5).map(m => (
                      <div key={m.id} className="flex items-start gap-3 rounded-xl border border-h-border px-3.5 py-3">
                        <Activity className="w-4 h-4 text-h-text-muted mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge tone="blue">{m.type}</Badge>
                            <span className="text-xs text-h-text-muted">{new Date(m.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-h-text">{m.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
 
                {prescriptions.length > 0 && (
                  <div className="card p-5">
                    <h4 className="section-title">Prescriptions</h4>
                    <div className="space-y-2">
                      {prescriptions.map(rx => (
                        <div key={rx.id} className="flex items-center justify-between rounded-xl border border-h-border px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-h-text">{rx.drug_code}</p>
                            <p className="text-xs text-h-text-muted">{rx.dosage}</p>
                          </div>
                          <Badge tone={rx.status === 'dispensed' ? 'green' : 'blue'}>{rx.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
 
      <Modal open={modal} onClose={() => setModal(false)} title={isNurse ? 'Record vitals' : 'New clinical entry'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">Patient</label>
            <input className="input-field bg-h-bg text-h-text-muted" value={selected?.full_name || ''} disabled readOnly />
          </div>
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">
              {isNurse ? 'Vitals (BP / HR / Temp)' : 'Details'}
            </label>
            <textarea rows={3}
              placeholder={isNurse ? 'e.g. BP 120/80 · HR 72 bpm · Temp 36.6°C' : 'Describe the diagnosis or finding…'}
              value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))}
              className="input-field resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">Save entry</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
 