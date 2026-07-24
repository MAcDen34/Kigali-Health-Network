'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Badge from '@/components/ui/Badge';
import KPICard from '@/components/ui/KPICard';
import { ShieldCheck, ShieldOff, Clock3, FileText, AlertTriangle, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { getPatient } from '@/lib/api';

const TYPE_TONE = { Diagnosis:'blue', 'Lab Result':'teal', Vitals:'green', Prescription:'purple' };

export default function RecordsPage() {
  const { state, dispatch } = useApp();
  const [realPatient, setRealPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPatient("82e6c070-9fef-4869-82b2-4ac45e7b7d30")
      .then(data => {
        setRealPatient(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const { patientProfile, consents, medicalHistory: allHistory, auditLog } = state;
  const medicalHistory = allHistory.filter(m => m.patient === patientProfile.name);
  const [tab, setTab] = useState('history');
  const active = consents.filter(c => c.status === 'active').length;

  const toggle = (id) => dispatch({ type: 'TOGGLE_CONSENT', payload: id });

  return (
    <div className="animate-fade-in space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active consents"  value={active}                        icon="ShieldCheck"   color="teal"  />
        <KPICard title="Blood group"      value={patientProfile.bloodGroup}      icon="Droplets"      color="red"   />
        <KPICard title="Allergies"        value={patientProfile.allergies.length}icon="AlertTriangle" color="amber" />
        <KPICard title="Record entries"   value={medicalHistory.length}          icon="FileText"      color="blue"  />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="card p-5 lg:col-span-1 h-fit">
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-3 pb-4 border-b border-h-border">
                <div className="w-12 h-12 rounded-2xl animate-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 rounded animate-shimmer" />
                  <div className="h-3 w-24 rounded animate-shimmer" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3.5 w-full rounded animate-shimmer" />
                <div className="h-3.5 w-full rounded animate-shimmer" />
                <div className="h-3.5 w-2/3 rounded animate-shimmer" />
              </div>
            </div>
          )}
          {error && (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 text-h-red mx-auto mb-3" />
              <p className="text-sm font-semibold text-h-text mb-1">Couldn&rsquo;t load patient data</p>
              <p className="text-xs text-h-text-muted">{error}</p>
            </div>
          )}
          {(!loading && !error && realPatient) && (
            <>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-h-border">
                <div className="w-12 h-12 rounded-2xl bg-h-teal-light text-h-teal text-base font-bold flex items-center justify-center">
                  RP
                </div>
                <div>
                  <p className="font-semibold text-h-text">Real Patient (Live Data)</p>
                  <p className="text-xs text-h-text-muted">Patient ID: {realPatient.id}</p>
                </div>
              </div>
              <dl className="space-y-3 text-sm">
                {[
                  ['Date of birth', realPatient.dob],
                  ['Blood group',   realPatient.blood_group],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <dt className="text-h-text-muted flex-shrink-0">{k}</dt>
                    <dd className="text-h-text font-medium text-right">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-2">
                  <dt className="text-h-text-muted flex-shrink-0">National ID</dt>
                  <dd className="text-h-text font-mono text-xs text-right">{realPatient.national_id}</dd>
                </div>
              </dl>
              <div className="mt-4 pt-4 border-t border-h-border">
                <p className="text-xs font-semibold text-h-text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-h-amber" /> Allergies on file
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {realPatient.allergies.map(a => <Badge key={a} tone="amber">{a}</Badge>)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs: history / consent / audit */}
        <div className="card lg:col-span-2">
          <div className="flex border-b border-h-border px-5">
            {[['history','Medical History'],['consent','Consent Grants'],['audit','Access Log']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`text-sm font-medium px-1 py-3.5 mr-5 transition-colors ${tab===k?'tab-active':'tab-inactive'}`}>
                {l}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === 'history' && (
              <div className="space-y-3">
                {medicalHistory.map(m => (
                  <div key={m.id} className="flex items-start gap-3 rounded-xl border border-h-border px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-h-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-h-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge tone={TYPE_TONE[m.type] || 'gray'}>{m.type}</Badge>
                        {m.icdCode && <span className="text-[11px] font-mono text-h-text-light">{m.icdCode}</span>}
                        <span className="text-xs text-h-text-muted ml-auto">{m.date}</span>
                      </div>
                      <p className="text-sm text-h-text">{m.detail}</p>
                      <p className="text-xs text-h-text-muted mt-1">{m.institution} · {m.doctor}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'consent' && (
              <div className="space-y-2.5">
                <p className="text-xs text-h-text-muted mb-3">You control who can access your health data. Revoke access at any time.</p>
                {consents.map(c => (
                  <div key={c.id} className={`flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors ${
                    c.status === 'active' ? 'border-h-teal/25 bg-h-teal-light/30' : 'border-h-border bg-h-bg'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        c.status === 'active' ? 'bg-h-teal-light text-h-teal' : 'bg-h-bg text-h-text-muted'
                      }`}>
                        {c.status === 'active' ? <ShieldCheck className="w-4.5 h-4.5" /> : <ShieldOff className="w-4.5 h-4.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-h-text truncate">{c.institution}</p>
                        <p className="text-xs text-h-text-muted">{c.type} · Granted {c.grantedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <Badge tone={c.status === 'active' ? 'green' : 'gray'}>
                        {c.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : null}
                        {c.status === 'active' ? 'Active' : 'Revoked'}
                      </Badge>
                      <button onClick={() => toggle(c.id)}
                        className="text-xs font-semibold text-h-blue hover:text-h-blue-dark transition-colors">
                        {c.status === 'active' ? 'Revoke' : 'Re-grant'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'audit' && (
              <div className="space-y-1">
                {auditLog.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-3 border-b border-h-border last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Clock3 className="w-4 h-4 text-h-text-light flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-h-text truncate">{a.actor}</p>
                        <p className="text-xs text-h-text-muted truncate">{a.action} · {a.institution}</p>
                      </div>
                    </div>
                    <span className="text-xs text-h-text-light flex-shrink-0 ml-3 whitespace-nowrap">{a.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
