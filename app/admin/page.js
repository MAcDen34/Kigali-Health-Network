'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Badge from '@/components/ui/Badge';
import KPICard from '@/components/ui/KPICard';
import { Building2, KeyRound, CheckCircle2, AlertCircle, Activity, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Wraps long service names onto two lines instead of an angled label.
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
  const { institutions, serviceHealth, platformAudit } = state;
  const [tab, setTab] = useState('institutions');

  const healthy = serviceHealth.filter(s => s.status === 'healthy').length;
  const pending = institutions.filter(i => i.status === 'pending').length;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Institutions"    value={institutions.length}    icon="Building2"  color="blue"   />
        <KPICard title="Services online" value={`${healthy}/${serviceHealth.length}`} icon="Activity" color={healthy===serviceHealth.length?'green':'amber'} />
        <KPICard title="Pending review"  value={pending}                icon="Clock"      color="amber"  />
        <KPICard title="Audit events"    value={platformAudit.length}   icon="Shield"     color="purple" />
      </div>

      <div className="card p-5">
        <h3 className="section-title">Service latency</h3>
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
          {[['institutions','Institutions'],['health','Service Health'],['audit','Platform Audit']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`text-sm font-medium px-1 py-3.5 mr-5 transition-colors ${tab===k?'tab-active':'tab-inactive'}`}>
              {l}
            </button>
          ))}
          {tab === 'institutions' && (
            <button className="btn-primary ml-auto my-2.5 text-xs py-2 px-3.5">
              <Plus className="w-3.5 h-3.5" /> Onboard institution
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
                      <p className="text-xs text-h-text-muted">{inst.type} · {inst.staff} staff · Joined {inst.joined}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-mono text-h-text-muted">{inst.apiToken}</span>
                    <Badge tone={inst.status === 'active' ? 'green' : 'amber'}>
                      {inst.status === 'active' ? 'Active' : 'Pending review'}
                    </Badge>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-h-blue hover:text-h-blue-dark transition-colors">
                      <KeyRound className="w-3.5 h-3.5" /> Manage token
                    </button>
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
                      <p className="text-xs font-mono text-h-text-muted">:{s.port} · uptime {s.uptime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${s.latency > 100 ? 'text-h-amber' : 'text-h-green'}`}>{s.latency}ms</p>
                      <p className="text-xs text-h-text-muted">avg latency</p>
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
                      <p className="text-sm font-semibold text-h-text truncate">{a.actor}</p>
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
  );
}
