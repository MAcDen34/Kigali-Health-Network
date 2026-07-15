'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Badge from '@/components/ui/Badge';
import KPICard from '@/components/ui/KPICard';
import { CheckCircle2, XCircle, Banknote, Clock3, Filter } from 'lucide-react';

const STATUS = {
  pending:  { tone:'amber', label:'Pending' },
  approved: { tone:'blue',  label:'Approved' },
  paid:     { tone:'green', label:'Paid' },
  rejected: { tone:'red',   label:'Rejected' },
};

export default function InsurancePage() {
  const { state, dispatch } = useApp();
  const { claims } = state;
  const [filter, setFilter] = useState('all');

  const update = (id, status) => dispatch({ type:'UPDATE_CLAIM', payload:{ id, status }});

  const list = filter === 'all' ? claims : claims.filter(c => c.status === filter);
  const pending = claims.filter(c => c.status === 'pending').length;
  const paid = claims.filter(c => c.status === 'paid').length;
  const totalPending = claims.filter(c => c.status === 'pending').reduce((s,c) => s + c.amount, 0);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total claims"    value={claims.length} icon="FileStack"    color="purple" />
        <KPICard title="Pending review"  value={pending}       icon="Clock"        color="amber"  />
        <KPICard title="Paid"            value={paid}          icon="CheckCircle"  color="green"  />
        <KPICard title="Pending value"   value={`RWF ${(totalPending/1000).toFixed(0)}K`} icon="Banknote" color="blue" />
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-h-purple/20 bg-h-purple-light px-4 py-3 text-xs text-h-purple font-medium flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        Billing-relevant data only — no clinical notes or personal details exposed to insurance agents.
      </div>

      <div className="card p-5">
        {/* Filter tabs */}
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

        {/* Table */}
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
                <tr key={c.id} className="border-b border-h-border last:border-0 hover:bg-h-bg transition-colors">
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
