'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Badge from '@/components/ui/Badge';
import KPICard from '@/components/ui/KPICard';
import { ShieldCheck, ShieldOff, Clock3, FileText, AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';
import { getPatient, listMyConsents, listMyMedicalRecords, listMyAuditLog, revokeConsent, grantConsent } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TYPE_TONE = { Diagnosis: 'blue', 'Lab Result': 'teal', Vitals: 'green', Prescription: 'purple' };

const INSTITUTION_NAMES = {
  '55555555-5555-5555-5555-555555555555': 'King Faisal Hospital',
  '66666666-6666-6666-6666-666666666666': 'King Faisal Hospital',
  '77777777-7777-7777-7777-777777777777': 'Legacy Clinic — Remera',
};

export default function RecordsPage() {
  const { state } = useApp();
  const patientId = state.user?.id;
  const token = state.user?.token;

  const [realPatient, setRealPatient] = useState(null);
  const [consents, setConsents] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('history');

  useEffect(() => {
    if (!patientId || !token) return;
    Promise.all([
      getPatient(patientId),
      listMyConsents(patientId, token),
      listMyMedicalRecords(patientId, token),
      listMyAuditLog(patientId, token),
    ])
      .then(([patient, consentData, historyData, auditData]) => {
        setRealPatient(patient);
        setConsents(consentData);
        setMedicalHistory(historyData);
        setAuditLog(auditData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [patientId, token]);

  const active = consents.filter(c => !c.revoked_at).length;

  const visitsByInstitution = Object.values(
    medicalHistory.reduce((acc, m) => {
      const name = m.content?.institution || 'Unknown';
      acc[name] = acc[name] || { institution: name, visits: 0 };
      acc[name].visits += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.visits - a.visits);

  const handleRevoke = async (consentId) => {
    try {
      await revokeConsent(consentId, token);
      const updated = await listMyConsents(patientId, token);
      setConsents(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGrant = async (institutionId) => {
    try {
      await grantConsent(patientId, institutionId, token);
      const updated = await listMyConsents(patientId, token);
      setConsents(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active consents"  value={active}                                icon="ShieldCheck"   color="teal"  />
        <KPICard title="Blood group"      value={realPatient?.blood_group || '—'}       icon="Droplets"      color="red"   />
        <KPICard title="Allergies"        value={realPatient?.allergies?.length || 0}   icon="AlertTriangle" color="amber" />
        <KPICard title="Record entries"   value={medicalHistory.length}                  icon="FileText"      color="blue"  />
      </div>

      <div className="card p-5">
        <h3 className="section-title">Most frequented hospitals</h3>
        {visitsByInstitution.length === 0 ? (
          <p className="text-sm text-h-text-muted">No recorded visits yet.</p>
        ) : (
          <div style={{ height: Math.max(visitsByInstitution.length * 44, 100) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitsByInstitution} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-h-border))" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: 'rgb(var(--color-h-text-muted))', fontSize: 12 }} axisLine={{ stroke: 'rgb(var(--color-h-border))' }} tickLine={false} />
                <YAxis type="category" dataKey="institution" width={160} tick={{ fill: 'rgb(var(--color-h-text-muted))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgb(var(--color-h-bg))' }}
                  formatter={(value) => [`${value} visit${value === 1 ? '' : 's'}`, 'Visits']}
                  contentStyle={{ background: 'rgb(var(--color-h-surface))', border: '1px solid rgb(var(--color-h-border))', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: 'rgb(var(--color-h-text))', fontWeight: 600, marginBottom: 4 }}
                  itemStyle={{ color: 'rgb(var(--color-h-text-muted))' }}
                />
                <Bar dataKey="visits" radius={[0, 6, 6, 0]} maxBarSize={28} fill="rgb(var(--color-h-teal))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
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
              <WifiOff className="w-8 h-8 text-h-text-light mx-auto mb-3" />
              <p className="text-sm font-semibold text-h-text mb-1">Live records service offline</p>
              <p className="text-xs text-h-text-muted max-w-[220px] mx-auto">{error}</p>
            </div>
          )}
          {(!loading && !error && realPatient) && (
            <>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-h-border">
                <div className="w-12 h-12 rounded-2xl bg-h-teal-light text-h-teal text-base font-bold flex items-center justify-center">
                  {(realPatient.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-h-text">{realPatient.full_name || 'Patient'}</p>
                  <p className="text-xs text-h-text-muted">Patient ID: {realPatient.id}</p>
                </div>
              </div>
              <dl className="space-y-3 text-sm">
                {[
                  ['Date of birth', realPatient.dob],
                  ['Blood group',   realPatient.blood_group],
                ].map(([k, v]) => (
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
                  {(realPatient.allergies || []).length === 0
                    ? <span className="text-xs text-h-text-muted">None on file</span>
                    : realPatient.allergies.map(a => <Badge key={a} tone="amber">{a}</Badge>)}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card lg:col-span-2">
          <div className="flex border-b border-h-border px-5">
            {[['history', 'Medical History'], ['consent', 'Consent Grants'], ['audit', 'Access Log']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`text-sm font-medium px-1 py-3.5 mr-5 transition-colors ${tab === k ? 'tab-active' : 'tab-inactive'}`}>
                {l}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === 'history' && (
              <div className="space-y-3">
                {medicalHistory.length === 0 && <p className="text-sm text-h-text-muted">No medical records yet.</p>}
                {medicalHistory.map(m => (
                  <div key={m.id} className="flex items-start gap-3 rounded-xl border border-h-border px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-h-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-h-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge tone={TYPE_TONE[m.type] || 'gray'}>{m.type}</Badge>
                        {m.content?.icd_code && <span className="text-[11px] font-mono text-h-text-light">{m.content.icd_code}</span>}
                        <span className="text-xs text-h-text-muted ml-auto">{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-h-text">{m.content?.detail || m.content?.note || m.content?.description || ""}</p>
                      <p className="text-xs text-h-text-muted mt-1">{m.content?.institution} · {m.content?.doctor}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'consent' && (
              <div className="space-y-2.5">
                <p className="text-xs text-h-text-muted mb-3">You control who can access your health data. Revoke access at any time.</p>
                {consents.length === 0 && <p className="text-sm text-h-text-muted">No consent grants yet.</p>}
                {consents.map(c => {
                  const isActive = !c.revoked_at;
                  const institutionName = INSTITUTION_NAMES[c.institution_id] || c.institution_id;
                  return (
                    <div key={c.id} className={`flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors ${
                      isActive ? 'border-h-teal/25 bg-h-teal-light/30' : 'border-h-border bg-h-bg'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-h-teal-light text-h-teal' : 'bg-h-bg text-h-text-muted'
                        }`}>
                          {isActive ? <ShieldCheck className="w-4.5 h-4.5" /> : <ShieldOff className="w-4.5 h-4.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-h-text truncate">{institutionName}</p>
                          <p className="text-xs text-h-text-muted">Granted {new Date(c.granted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <Badge tone={isActive ? 'green' : 'gray'}>
                          {isActive ? <CheckCircle2 className="w-3 h-3" /> : null}
                          {isActive ? 'Active' : 'Revoked'}
                        </Badge>
                        {isActive ? (
                          <button onClick={() => handleRevoke(c.id)}
                            className="text-xs font-semibold text-h-blue hover:text-h-blue-dark transition-colors">
                            Revoke
                          </button>
                        ) : (
                          <button onClick={() => handleGrant(c.institution_id)}
                            className="text-xs font-semibold text-h-teal hover:text-h-teal-dark transition-colors">
                            Restore access
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'audit' && (
              <div className="space-y-1">
                {auditLog.length === 0 && <p className="text-sm text-h-text-muted">No access events recorded yet.</p>}
                {auditLog.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-3 border-b border-h-border last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Clock3 className="w-4 h-4 text-h-text-light flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-h-text truncate">
                          {a.actor_id === patientId ? 'You' : a.actor_id}
                        </p>
                        <p className="text-xs text-h-text-muted truncate">{a.action}</p>
                      </div>
                    </div>
                    <span className="text-xs text-h-text-light flex-shrink-0 ml-3 whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</span>
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
