'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Badge from '@/components/ui/Badge';
import KPICard from '@/components/ui/KPICard';
import { Search, AlertTriangle, CheckCircle2, Pill, Filter } from 'lucide-react';

const STATUS_TONE = { active:'blue', dispensed:'green', flagged:'red' };

export default function PharmacyPage() {
  const { state, dispatch } = useApp();
  const { prescriptions } = state;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const dispense = (id) => dispatch({ type: 'DISPENSE_RX', payload: id });

  const list = prescriptions.filter(rx => {
    const matchQ = rx.patient.toLowerCase().includes(query.toLowerCase()) ||
      rx.drug.toLowerCase().includes(query.toLowerCase()) ||
      rx.code.toLowerCase().includes(query.toLowerCase());
    const matchF = filter === 'all' || rx.status === filter || (filter === 'flagged' && rx.flag);
    return matchQ && matchF;
  });

  const pending = prescriptions.filter(rx => rx.status !== 'dispensed').length;
  const flagged = prescriptions.filter(rx => rx.flag).length;
  const dispensed = prescriptions.filter(rx => rx.status === 'dispensed').length;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Queue total"  value={prescriptions.length} icon="ClipboardList" color="blue"  />
        <KPICard title="Pending"      value={pending}              icon="Clock"         color="amber" />
        <KPICard title="Dispensed"    value={dispensed}            icon="CheckCircle"   color="green" />
        <KPICard title="Flagged"      value={flagged}              icon="AlertTriangle" color="red"   />
      </div>

      <div className="card p-5">
        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-h-text-light" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by patient, drug or code…"
              className="input-field pl-10" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-h-text-muted flex-shrink-0" />
            {['all','active','dispensed','flagged'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors capitalize ${
                  filter === f ? 'bg-h-blue text-white' : 'bg-h-bg text-h-text-muted hover:text-h-text border border-h-border'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Prescription list */}
        <div className="space-y-2.5">
          {list.map(rx => (
            <div key={rx.id}
              className={`rounded-xl border px-4 py-4 transition-colors ${
                rx.flag ? 'border-h-red/25 bg-h-red-light/30' : 'border-h-border hover:border-h-blue/25'
              }`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    rx.flag ? 'bg-h-red-light text-h-red' : 'bg-h-blue-light text-h-blue'
                  }`}>
                    {rx.flag ? <AlertTriangle className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-h-text">{rx.drug}</p>
                      <span className="text-xs font-mono text-h-text-muted">{rx.code}</span>
                      <Badge tone={STATUS_TONE[rx.status] || 'gray'}>{rx.status}</Badge>
                    </div>
                    <p className="text-xs text-h-text-muted">{rx.patient} · {rx.dosage} · {rx.doctor} · {rx.date}</p>
                    {rx.flag && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-h-red" />
                        <span className="text-xs font-semibold text-h-red">
                          {rx.flag === 'interaction' ? 'Drug-drug interaction risk detected' : 'Allergy conflict — patient is allergic to this drug class'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {rx.status === 'dispensed'
                    ? <span className="flex items-center gap-1.5 text-h-green text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Dispensed
                      </span>
                    : <button onClick={() => dispense(rx.id)}
                        className={rx.flag ? 'btn-danger text-xs py-2 px-3.5' : 'btn-teal text-xs py-2 px-3.5'}>
                        {rx.flag ? 'Override & dispense' : 'Mark dispensed'}
                      </button>
                  }
                </div>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="text-center py-12 text-h-text-muted">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No prescriptions match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
