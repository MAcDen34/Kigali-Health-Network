'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Badge from '@/components/ui/Badge';
import KPICard from '@/components/ui/KPICard';
import { CheckCircle2, XCircle, Banknote, Clock3, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS = {
  pending:  { tone:'amber', label:'Pending',  chartColor:'rgb(var(--color-h-amber))' },
  approved: { tone:'blue',  label:'Approved', chartColor:'rgb(var(--color-h-blue))'  },
  paid:     { tone:'green', label:'Paid',     chartColor:'rgb(var(--color-h-green))' },
  rejected: { tone:'red',   label:'Rejected', chartColor:'rgb(var(--color-h-red))'   },
};

export default function InsurancePage() {
  const { state, dispatch } = useApp();
  const { claims } = state;
  const [filter, setFilter] = useState('all');
  const [highlightClaimId, setHighlightClaimId] = useState(null);
  const searchParams = useSearchParams();

  // Deep-linked from header search: clear filter, scroll into view, flash.
  useEffect(() => {
    const claimId = searchParams.get('claim');
    if (!claimId) return;
    const match = claims.find(c => c.id === claimId);
    if (!match) return;
    setFilter('all');
    setHighlightClaimId(match.id);
    requestAnimationFrame(() => {
      document.getElementById(`claim-row-${match.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const t = setTimeout(() => setHighlightClaimId(null), 2200);
    return () => clearTimeout(t);
  }, [searchParams, claims]);

  const update = (id, status) => dispatch({ type:'UPDATE_CLAIM', payload:{ id, status }});

  const list = filter === 'all' ? claims : claims.filter(c => c.status === filter);
  const pending = claims.filter(c => c.status === 'pending').length;
  const paid = claims.filter(c => c.status === 'paid').length;
  const totalPending = claims.filter(c => c.status === 'pending').reduce((s,c) => s + c.amount, 0);

  const chartData = Object.keys(STATUS).map(key => ({
    key,
    label: STATUS[key].label,
    amount: claims.filter(c => c.status === key).reduce((s, c) => s + c.amount, 0),
  }));

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total claims"    value={claims.length} icon="FileStack"    color="purple" />
        <KPICard title="Pending review"  value={pending}       icon="Clock"        color="amber"  />
        <KPICard title="Paid"            value={paid}          icon="CheckCircle"  color="green"  />
        <KPICard title="Pending value"   value={`RWF ${(totalPending/1000).toFixed(0)}K`} icon="Banknote" color="blue" />
      </div>

      <div className="rounded-xl border border-h-purple/20 bg-h-purple-light px-4 py-3 text-xs text-h-purple font-medium flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        Billing-relevant data only — no clinical notes or personal details exposed to insurance agents.
      </div>

      <div className="card p-5">
        <h3 className="section-title">Claim value by status</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-h-border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'rgb(var(--color-h-text-muted))', fontSize: 12 }} axisLine={{ stroke: 'rgb(var(--color-h-border))' }} tickLine={false} />
              <YAxis tick={{ fill: 'rgb(var(--color-h-text-muted))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} width={40} />
              <Tooltip
                cursor={{ fill: 'rgb(var(--color-h-bg))' }}
                formatter={(value) => [`RWF ${value.toLocaleString()}`, 'Total']}
                contentStyle={{ background: 'rgb(var(--color-h-surface))', border: '1px solid rgb(var(--color-h-border))', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'rgb(var(--color-h-text))', fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: 'rgb(var(--color-h-text-muted))' }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {chartData.map(d => <Cell key={d.key} fill={STATUS[d.key].chartColor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <Filter className="w-4 h-4 text-h-text-muted" />
          {['all','pending','approved','paid','rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${
                filter === f ? 'bg-h-blue text-white' : 'bg-h-bg text-h-text-muted hover:text-h-text border border-h-border'
              }`}>{f}</button>
          ))}
          <span className="ml-auto text-xs text-h-text-muted">{list.length} claims</span>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-left text-xs text-h-text-muted uppercase tracking-wide border-b border-h-border">
                {['Claim ID','Patient','Institution','Diag. Code','Service','Amount','Status','Action'].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id} id={`claim-row-${c.id}`}
                  className={`border-b border-h-border last:border-0 transition-colors duration-700 ${
                    highlightClaimId === c.id ? 'bg-h-bg' : 'hover:bg-h-bg'
                  }`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-h-text-muted">{c.id}</td>
                  <td className="px-5 py-3.5 text-h-text font-semibold">{c.patient}</td>
                  <td className="px-5 py-3.5 text-h-text-muted text-xs">{c.institution}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-h-blue">{c.diagCode}</td>
                  <td className="px-5 py-3.5 text-h-text-muted text-xs">{c.service}</td>
                  <td className="px-5 py-3.5 text-h-text font-semibold">RWF {c.amount.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={STATUS[c.status]?.tone || 'gray'}>{STATUS[c.status]?.label || c.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => update(c.id,'approved')}
                          className="flex items-center gap-1 text-xs font-semibold text-h-green hover:opacity-75 transition-opacity">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <span className="text-h-border">|</span>
                        <button onClick={() => update(c.id,'rejected')}
                          className="flex items-center gap-1 text-xs font-semibold text-h-red hover:opacity-75 transition-opacity">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                    {c.status === 'approved' && (
                      <button onClick={() => update(c.id,'paid')}
                        className="flex items-center gap-1 text-xs font-semibold text-h-blue hover:opacity-75 transition-opacity">
                        <Banknote className="w-3.5 h-3.5" /> Mark paid
                      </button>
                    )}
                    {(c.status === 'paid' || c.status === 'rejected') && (
                      <span className="text-xs text-h-text-light">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
