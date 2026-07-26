'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { listInstitutions, listAuditEvents, checkServicesHealth, listStaff, createStaff, deactivateStaff, reactivateStaff, updateInstitution, createInstitution } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import KPICard from '@/components/ui/KPICard';
import { Building2, CheckCircle2, AlertCircle, Activity, Plus, UserX, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ROLE_OPTIONS = ['DOCTOR', 'NURSE', 'PHARMACIST', 'INSURANCE_AGENT', 'PLATFORM_ADMIN'];

function ServiceNameTick({ x, y, payload }) {
  const words = payload.value.split(' ');
  let line1 = payload.value;
  let line2 = '';
  if (words.length > 1) {
    line2 = words.pop();
    line1 = words.join(' ');
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="rgb(var(--color-h-text-muted))" fontSize={11}>
        <tspan x={0} dy={12}>{line1}</tspan>
        {line2 && <tspan x={0} dy={13}>{line2}</tspan>}
      </text>
    </g>
  );
}

export default function AdminPage() {
  const { state } = useApp();
  const token = state.user?.token;

  const [institutions, setInstitutions] = useState([]);
  const [platformAudit, setPlatformAudit] = useState([]);
  const [serviceHealth, setServiceHealth] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('institutions');
  const [refreshKey, setRefreshKey] = useState(0);
  const [staffModal, setStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({ full_name: '', email: '', password: '', role: 'DOCTOR', institution_id: '' });
  const [staffError, setStaffError] = useState(null);
  const [instModal, setInstModal] = useState(false);
  const [instForm, setInstForm] = useState({ name: '', type: 'Hospital' });
  const [instError, setInstError] = useState(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      listInstitutions(token),
      listAuditEvents(token),
      checkServicesHealth(token),
      listStaff(token),
    ])
      .then(([inst, audit, health, staffList]) => {
        setInstitutions(inst);
        setPlatformAudit(audit);
        setServiceHealth(health.map(h => ({ ...h, name: h.service })));
        setStaff(staffList);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, refreshKey]);

  if (loading) return <div className="p-5 text-sm text-h-text-muted">Loading platform data...</div>;
  if (error) return <div className="p-5 text-sm text-red-500">Error: {error}</div>;

  const healthy = serviceHealth.filter(s => s.status === 'healthy').length;
  const pending = institutions.filter(i => !i.active).length;
  const institutionName = (id) => institutions.find(i => i.id === id)?.name || '—';

  const handleCreateStaff = async () => {
    setStaffError(null);
    try {
      await createStaff({
        full_name: staffForm.full_name,
        email: staffForm.email,
        password: staffForm.password,
        role: staffForm.role,
        institution_id: staffForm.institution_id || null,
      }, token);
      setStaffModal(false);
      setStaffForm({ full_name: '', email: '', password: '', role: 'DOCTOR', institution_id: '' });
      setRefreshKey(k => k + 1);
    } catch (err) {
      setStaffError(err.message);
    }
  };

  const handleDeactivate = async (staffId) => {
    try {
      await deactivateStaff(staffId, token);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReactivate = async (staffId) => {
    try {
      await reactivateStaff(staffId, token);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleInstitution = async (institutionId, currentlyActive) => {
    try {
      await updateInstitution(institutionId, { active: !currentlyActive }, token);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateInstitution = async () => {
    setInstError(null);
    try {
      await createInstitution(instForm, token);
      setInstModal(false);
      setInstForm({ name: '', type: 'Hospital' });
      setRefreshKey(k => k + 1);
    } catch (err) {
      setInstError(err.message);
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Institutions"    value={institutions.length}    icon="Building2"  color="blue"   />
        <KPICard title="Services online" value={`${healthy}/${serviceHealth.length}`} icon="Activity" color={healthy===serviceHealth.length?'green':'amber'} />
        <KPICard title="Pending review"  value={pending}                icon="Clock"      color="amber"  />
        <KPICard title="Audit events"    value={platformAudit.length}   icon="Shield"     color="purple" />
      </div>

      <div className="card p-5">
        <h3 className="section-title">Service latency (live)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceHealth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-h-border))" vertical={false} />
              <XAxis dataKey="name" tick={<ServiceNameTick />} axisLine={{ stroke: 'rgb(var(--color-h-border))' }} tickLine={false} interval={0} height={40} />
              <YAxis tick={{ fill: 'rgb(var(--color-h-text-muted))', fontSize: 12 }} axisLine={false} tickLine={false} width={52} unit="ms" />
              <Tooltip
                cursor={{ fill: 'rgb(var(--color-h-bg))' }}
                formatter={(value) => [`${value}ms`, 'Latency']}
                contentStyle={{ background: 'rgb(var(--color-h-surface))', border: '1px solid rgb(var(--color-h-border))', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'rgb(var(--color-h-text))', fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: 'rgb(var(--color-h-text-muted))' }}
              />
              <Bar dataKey="latency" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {serviceHealth.map(s => (
                  <Cell key={s.name} fill={s.status === 'healthy' ? 'rgb(var(--color-h-green))' : 'rgb(var(--color-h-amber))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex border-b border-h-border px-5">
          {[['institutions','Institutions'],['staff','Staff'],['health','Service Health'],['audit','Platform Audit']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`text-sm font-medium px-1 py-3.5 mr-5 transition-colors ${tab===k?'tab-active':'tab-inactive'}`}>
              {l}
            </button>
          ))}
          {tab === 'institutions' && (
            <button onClick={() => setInstModal(true)} className="btn-primary ml-auto my-2.5 text-xs py-2 px-3.5">
              <Plus className="w-3.5 h-3.5" /> Onboard institution
            </button>
          )}
          {tab === 'staff' && (
            <button onClick={() => setStaffModal(true)} className="btn-primary ml-auto my-2.5 text-xs py-2 px-3.5">
              <Plus className="w-3.5 h-3.5" /> Add staff
            </button>
          )}
        </div>

        <div className="p-5">
          {tab === 'institutions' && (
            <div className="space-y-3">
              {institutions.map(inst => (
                <div key={inst.id} className="flex items-center justify-between rounded-xl border border-h-border px-4 py-4 hover:border-h-blue/25 hover:bg-h-blue-light/20 transition-colors flex-wrap gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-h-blue-light text-h-blue flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-h-text">{inst.name}</p>
                      <p className="text-xs text-h-text-muted">{inst.type} · {inst.staff_count} staff · Joined {new Date(inst.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge tone={inst.active ? 'green' : 'amber'}>
                      {inst.active ? 'Active' : 'Pending review'}
                    </Badge>
                    {inst.active ? (
                      <button onClick={() => handleToggleInstitution(inst.id, true)} className="btn-danger text-xs py-2 px-3.5">
                        Suspend
                      </button>
                    ) : (
                      <button onClick={() => handleToggleInstitution(inst.id, false)} className="btn-teal text-xs py-2 px-3.5">
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'staff' && (
            <div className="space-y-3">
              {staff.length === 0 && <p className="text-sm text-h-text-muted">No staff accounts yet.</p>}
              {staff.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-h-border px-4 py-4 flex-wrap gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-h-text">{s.full_name}</p>
                    <p className="text-xs text-h-text-muted">{s.email} · {s.role} · {institutionName(s.institution_id)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge tone={s.active ? 'green' : 'gray'}>{s.active ? 'Active' : 'Deactivated'}</Badge>
                    {s.active ? (
                      <button onClick={() => handleDeactivate(s.id)} className="btn-danger text-xs py-2 px-3.5">
                        <UserX className="w-3.5 h-3.5" /> Deactivate
                      </button>
                    ) : (
                      <button onClick={() => handleReactivate(s.id)} className="btn-teal text-xs py-2 px-3.5">
                        <UserCheck className="w-3.5 h-3.5" /> Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'health' && (
            <div className="space-y-2.5">
              {serviceHealth.map(s => (
                <div key={s.name} className={`flex items-center justify-between rounded-xl border px-4 py-3.5 ${
                  s.status === 'degraded' ? 'border-h-amber/30 bg-h-amber-light/30' : 'border-h-border'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.status==='healthy'?'bg-h-green':'bg-h-amber animate-pulse'}`} />
                    <div>
                      <p className="text-sm font-semibold text-h-text">{s.name}</p>
                      <p className="text-xs font-mono text-h-text-muted">:{s.port}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${s.latency > 100 ? 'text-h-amber' : 'text-h-green'}`}>{s.latency}ms</p>
                      <p className="text-xs text-h-text-muted">live latency</p>
                    </div>
                    <Badge tone={s.status === 'healthy' ? 'green' : 'amber'}>
                      {s.status === 'healthy' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {s.status === 'healthy' ? 'Healthy' : 'Degraded'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'audit' && (
            <div className="space-y-1">
              {platformAudit.map(a => (
                <div key={a.id} className="flex items-center justify-between py-3.5 border-b border-h-border last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-h-bg flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-h-text-muted" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-h-text truncate">{a.actor_name || 'Unknown'}</p>
                      <p className="text-xs text-h-text-muted truncate">{a.action} {a.target ? `· ${a.target}` : ''}</p>
                    </div>
                  </div>
                  <span className="text-xs text-h-text-light flex-shrink-0 ml-3 whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={staffModal} onClose={() => setStaffModal(false)} title="Add staff account">
        <div className="space-y-4">
          {staffError && <p className="text-sm text-red-500">{staffError}</p>}
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">Full name</label>
            <input className="input-field" value={staffForm.full_name}
              onChange={e => setStaffForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">Email</label>
            <input type="email" className="input-field" value={staffForm.email}
              onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">Temporary password</label>
            <input type="password" className="input-field" value={staffForm.password}
              onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">Role</label>
            <select className="input-field" value={staffForm.role}
              onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))}>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">Institution (optional)</label>
            <select className="input-field" value={staffForm.institution_id}
              onChange={e => setStaffForm(f => ({ ...f, institution_id: e.target.value }))}>
              <option value="">None</option>
              {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setStaffModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreateStaff} className="btn-primary flex-1">Create account</button>
          </div>
        </div>
      </Modal>

      <Modal open={instModal} onClose={() => setInstModal(false)} title="Onboard institution">
        <div className="space-y-4">
          {instError && <p className="text-sm text-red-500">{instError}</p>}
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">Institution name</label>
            <input className="input-field" value={instForm.name}
              onChange={e => setInstForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-h-text mb-1.5">Type</label>
            <select className="input-field" value={instForm.type}
              onChange={e => setInstForm(f => ({ ...f, type: e.target.value }))}>
              {['Hospital', 'Clinic', 'Pharmacy', 'Insurance'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setInstModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreateInstitution} className="btn-primary flex-1">Onboard</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
