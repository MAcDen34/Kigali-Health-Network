'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ROLES, ROLE_ACCENT } from '@/data/roles';
import KPICard from '@/components/ui/KPICard';
import Badge from '@/components/ui/Badge';
import { Activity, ArrowRight, ShieldCheck, ShieldOff, AlertTriangle, CheckCircle2, Pill } from 'lucide-react';
import Link from 'next/link';
import { listMyConsents, listMyMedicalRecords, listMyAuditLog, listInstitutions, listAuditEvents, checkServicesHealth, listPatients, checkConsent, listAllPrescriptions, listAllInteractionFlags } from '@/lib/api';

const INSTITUTION_NAMES = {
  '55555555-5555-5555-5555-555555555555': 'King Faisal Hospital',
  '66666666-6666-6666-6666-666666666666': 'King Faisal Hospital',
  '77777777-7777-7777-7777-777777777777': 'Legacy Clinic — Remera',
};

function PatientDashboard({ state }) {
  const patientId = state.user?.id;
  const token = state.user?.token;
  const [consents, setConsents] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId || !token) return;
    Promise.all([
      listMyConsents(patientId, token),
      listMyMedicalRecords(patientId, token),
      listMyAuditLog(patientId, token),
    ])
      .then(([consentData, historyData, auditData]) => {
        setConsents(consentData);
        setMedicalHistory(historyData);
        setAuditLog(auditData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [patientId, token]);

  if (loading) return <p className="text-sm text-h-text-muted">Loading your dashboard...</p>;

  const active = consents.filter(c => !c.revoked_at).length;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Active consents"   value={active}                icon="ShieldCheck"   color="teal"   />
        <KPICard title="Medical records"   value={medicalHistory.length} icon="FileText"      color="blue"   />
        <KPICard title="Allergies on file" value={state.user?.allergies?.length || 0} icon="AlertTriangle" color="amber"  />
        <KPICard title="Access events"     value={auditLog.length} subtitle="All time" icon="Eye" color="purple" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Consent grants</h3>
            <Link href="/records" className="text-xs font-semibold text-h-blue flex items-center gap-1 hover:gap-2 transition-all">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {consents.length === 0 && <p className="text-sm text-h-text-muted">No consent grants yet.</p>}
            {consents.map(c => {
              const isActive = !c.revoked_at;
              return (
                <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-h-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-h-text">{INSTITUTION_NAMES[c.institution_id] || c.institution_id}</p>
                    <p className="text-xs text-h-text-muted">Granted {new Date(c.granted_at).toLocaleDateString()}</p>
                  </div>
                  <Badge tone={isActive ? 'green' : 'gray'}>
                    {isActive ? 'Active' : 'Revoked'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="section-title">Recent access log</h3>
          <div className="space-y-3">
            {auditLog.length === 0 && <p className="text-sm text-h-text-muted">No access events yet.</p>}
            {auditLog.slice(0, 4).map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-h-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5 text-h-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-h-text font-medium truncate">{a.actor_id === patientId ? 'You' : a.actor_id}</p>
                  <p className="text-xs text-h-text-muted truncate">{a.action}</p>
                </div>
                <span className="text-[11px] text-h-text-light flex-shrink-0">{new Date(a.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ClinicDashboard({ state }) {
  const { user } = state;
  const [patients, setPatients] = useState([]);
  const [consentMap, setConsentMap] = useState({});
  const [prescriptions, setPrescriptions] = useState([]);
  const [flagCount, setFlagCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token || !user?.institutionId) return;
    Promise.all([listPatients(user.token), listAllPrescriptions(user.token), listAllInteractionFlags(user.token)])
      .then(async ([list, rx, flags]) => {
        setPrescriptions(rx);
        setFlagCount(flags.length);
        const entries = await Promise.all(
          list.map(async (p) => [p.id, await checkConsent(p.id, user.institutionId, user.token).catch(() => null)])
        );
        setPatients(list);
        setConsentMap(Object.fromEntries(entries));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.token, user?.institutionId]);

  if (loading) return <p className="text-sm text-h-text-muted">Loading clinic summary...</p>;

  const consented = patients.filter(p => consentMap[p.id]).length;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Patients today"    value={patients.length}       icon="Users"          color="blue"  />
        <KPICard title="Consent granted"   value={consented}             icon="ShieldCheck"    color="teal"  />
        <KPICard title="Prescriptions"     value={prescriptions.length}  icon="Pill"           color="green" />
        <KPICard title="Interaction flags" value={flagCount}             icon="AlertTriangle"  color="amber" />
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">Patient list</h3>
          <Link href="/clinic" className="text-xs font-semibold text-h-blue flex items-center gap-1 hover:gap-2 transition-all">
            Open clinic <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {patients.slice(0, 4).map(p => (
          <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-h-border last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-h-blue-light text-h-blue text-xs font-bold flex items-center justify-center">
                {(p.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-h-text">{p.full_name}</p>
                <p className="text-xs text-h-text-muted">DOB {p.dob}</p>
              </div>
            </div>
            <Badge tone={consentMap[p.id] ? 'green' : 'red'}>{consentMap[p.id] ? 'Consented' : 'Blocked'}</Badge>
          </div>
        ))}
      </div>
    </>
  );
}

function PharmacyDashboard({ state }) {
  const { user } = state;
  const [prescriptions, setPrescriptions] = useState([]);
  const [flagMap, setFlagMap] = useState({});
  const [patientMap, setPatientMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listAllPrescriptions(user.token), listAllInteractionFlags(user.token), listPatients(user.token)])
      .then(([rx, flags, patients]) => {
        setPrescriptions(rx);
        setFlagMap(Object.fromEntries(flags.map(f => [f.prescription_id, f])));
        setPatientMap(Object.fromEntries(patients.map(p => [p.id, p.full_name])));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-h-text-muted">Loading pharmacy summary...</p>;

  const pending = prescriptions.filter(rx => rx.status !== 'dispensed').length;
  const flagged = prescriptions.filter(rx => flagMap[rx.id]).length;
  const dispensed = prescriptions.length - pending;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Queue total" value={prescriptions.length} icon="ClipboardList" color="blue"  />
        <KPICard title="Pending"     value={pending}              icon="Clock"          color="amber" />
        <KPICard title="Dispensed"   value={dispensed}            icon="CheckCircle"    color="green" />
        <KPICard title="Flagged"     value={flagged}              icon="AlertTriangle"  color="red"   />
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">Prescription queue</h3>
          <Link href="/pharmacy" className="text-xs font-semibold text-h-blue flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {prescriptions.slice(0, 5).map(rx => {
            const flag = flagMap[rx.id];
            return (
              <div key={rx.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${flag ? 'border-h-red/25 bg-h-red-light/40' : 'border-h-border'}`}>
                <div>
                  <p className="text-sm font-semibold text-h-text">{rx.drug_code}</p>
                  <p className="text-xs text-h-text-muted">{patientMap[rx.record_id] || 'Unknown'} · {rx.dosage}</p>
                </div>
                <div className="flex items-center gap-2">
                  {flag && <Badge tone="red">Interaction</Badge>}
                  <Badge tone={rx.status === 'dispensed' ? 'green' : 'blue'}>{rx.status}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function InsuranceDashboard({ state }) {
  const { claims } = state;
  const pending = claims.filter(c => c.status === 'pending').length;
  const paid = claims.filter(c => c.status === 'paid').length;
  const total = claims.reduce((s, c) => s + c.amount, 0);
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total claims"   value={claims.length}                       icon="FileStack"    color="purple" />
        <KPICard title="Pending review" value={pending}                             icon="Clock"        color="amber"  />
        <KPICard title="Paid"           value={paid}                                icon="CheckCircle"  color="green"  />
        <KPICard title="Total value"    value={`RWF ${(total / 1000).toFixed(0)}K`} icon="Banknote"    color="blue"   />
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">Claims queue</h3>
          <Link href="/insurance" className="text-xs font-semibold text-h-blue flex items-center gap-1 hover:gap-2 transition-all">
            Manage all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-h-text-muted uppercase tracking-wide border-b border-h-border">
                <th className="pb-2.5 font-semibold">Claim</th>
                <th className="pb-2.5 font-semibold">Patient</th>
                <th className="pb-2.5 font-semibold">Amount</th>
                <th className="pb-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(c => (
                <tr key={c.id} className="border-b border-h-border last:border-0">
                  <td className="py-3 font-mono text-xs text-h-text-muted">{c.id}</td>
                  <td className="py-3 text-h-text font-medium">{c.patient}</td>
                  <td className="py-3 text-h-text">RWF {c.amount.toLocaleString()}</td>
                  <td className="py-3">
                    <Badge tone={c.status === 'paid' ? 'green' : c.status === 'approved' ? 'blue' : c.status === 'rejected' ? 'red' : 'amber'}>
                      {c.status[0].toUpperCase() + c.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AdminDashboard({ state }) {
  const token = state.user?.token;
  const [institutions, setInstitutions] = useState([]);
  const [platformAudit, setPlatformAudit] = useState([]);
  const [serviceHealth, setServiceHealth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      listInstitutions(token),
      listAuditEvents(token),
      checkServicesHealth(token),
    ])
      .then(([inst, audit, health]) => {
        setInstitutions(inst);
        setPlatformAudit(audit);
        setServiceHealth(health.map(h => ({ ...h, name: h.service })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-sm text-h-text-muted">Loading platform data...</p>;

  const healthy = serviceHealth.filter(s => s.status === 'healthy').length;
  const pending = institutions.filter(i => !i.active).length;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Institutions"    value={institutions.length}                              icon="Building2" color="blue"                                                 />
        <KPICard title="Services online" value={`${healthy}/${serviceHealth.length}`}             icon="Activity"  color={healthy === serviceHealth.length ? 'green' : 'amber'} />
        <KPICard title="Pending onboard" value={pending}                                          icon="Clock"     color="amber"                                                />
        <KPICard title="Audit events"    value={platformAudit.length}                             icon="Shield"    color="purple"                                               />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Service health</h3>
            <Link href="/admin" className="text-xs font-semibold text-h-blue flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {serviceHealth.map(s => (
            <div key={s.name} className="flex items-center justify-between py-2.5 border-b border-h-border last:border-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${s.status === 'healthy' ? 'bg-h-green' : 'bg-h-amber animate-pulse'}`} />
                <div>
                  <p className="text-sm font-medium text-h-text">{s.name}</p>
                  <p className="text-xs font-mono text-h-text-muted">:{s.port}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-h-text-muted">{s.latency}ms</span>
                <Badge tone={s.status === 'healthy' ? 'green' : 'amber'}>{s.status}</Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <h3 className="section-title">Platform audit</h3>
          {platformAudit.length === 0 && <p className="text-sm text-h-text-muted">No audit events yet.</p>}
          {platformAudit.slice(0, 4).map(a => (
            <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-h-border last:border-0">
              <div className="w-7 h-7 rounded-full bg-h-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-h-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-h-text truncate">{a.actor_name || 'Unknown'}</p>
                <p className="text-xs text-h-text-muted truncate">{a.action}</p>
              </div>
              <span className="text-[11px] text-h-text-light flex-shrink-0 whitespace-nowrap">{new Date(a.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { state } = useApp();
  const { user } = state;
  if (!user) return null;

  const accent = ROLE_ACCENT[user.role] || '#5A8AA6';
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const renderDashboard = () => {
    switch (user.role) {
      case 'PATIENT':         return <PatientDashboard state={state} />;
      case 'DOCTOR':
      case 'NURSE':           return <ClinicDashboard state={state} />;
      case 'PHARMACIST':      return <PharmacyDashboard state={state} />;
      case 'INSURANCE_AGENT': return <InsuranceDashboard state={state} />;
      case 'PLATFORM_ADMIN':  return <AdminDashboard state={state} />;
      default:                return <p className="text-h-text-muted text-sm">Dashboard loading…</p>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="rounded-2xl p-5 mb-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${accent}15 0%, ${accent}05 100%)`, border: `1px solid ${accent}25` }}>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{ backgroundColor: `${accent}08` }} />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accent }}>
            {ROLES[user.role]}
          </p>
          <h2 className="text-xl font-bold text-h-text">
            {greet}, {user.name.split(' ')[0]}
          </h2>
          <p className="text-sm text-h-text-muted mt-1">
            Here is what is happening on the Kigali Health Network today.
          </p>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
}
