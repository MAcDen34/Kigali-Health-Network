'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ROLE_ACCENT } from '@/data/roles';
import Badge from '@/components/ui/Badge';
import KPICard from '@/components/ui/KPICard';
import { Search, AlertTriangle, CheckCircle2, Pill, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const STATUS_TONE = { active:'blue', dispensed:'green', flagged:'red' };
const STATUS_CHART_COLOR = {
  active:    'rgb(var(--color-h-blue))',
  dispensed: 'rgb(var(--color-h-green))',
  flagged:   'rgb(var(--color-h-red))',
};

export default function PharmacyPage() {
  const { state, dispatch } = useApp();
  const { user, prescriptions } = state;
  const accent = ROLE_ACCENT[user?.role] || '#5A8AA6';
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [highlightRxId, setHighlightRxId] = useState(null);

  // Deep-linked from header search — prefill the filter, then scroll to and
  // flash the exact prescription that was searched for (matched by code,
  // since that's what the header search links with).
  useEffect(() => {
    const q = searchParams.get('q');
    if (!q) return;
    setQuery(q);
    const match = prescriptions.find(rx => rx.code === q);
    if (!match) return;
    setHighlightRxId(match.id);
    requestAnimationFrame(() => {
      document.getElementById(`rx-row-${match.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const t = setTimeout(() => setHighlightRxId(null), 2200);
    return () => clearTimeout(t);
  }, [searchParams, prescriptions]);

  const [searchFocused, setSearchFocused] = useState(false);
  const [filter, setFilter] = useState('all');
  const [hoveredSlice, setHoveredSlice] = useState(null);

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

  const statusBreakdown = ['active', 'dispensed', 'flagged']
    .map(s => ({ key: s, value: prescriptions.filter(rx => rx.status === s).length }))
    .filter(d => d.value > 0);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Queue total"  value={prescriptions.length} icon="ClipboardList" color="blue"  />
        <KPICard title="Pending"      value={pending}              icon="Clock"         color="amber" />
        <KPICard title="Dispensed"    value={dispensed}            icon="CheckCircle"   color="green" />
        <KPICard title="Flagged"      value={flagged}              icon="AlertTriangle" color="red"   />
      </div>

      {/* Queue breakdown */}
      <div className="card p-5 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusBreakdown} dataKey="value" nameKey="key"
                innerRadius={38} outerRadius={58} paddingAngle={3} strokeWidth={0}
                onMouseEnter={(entry, _i, e) => setHoveredSlice({ key: entry.key, value: entry.value, x: e.clientX, y: e.clientY })}
                onMouseMove={(entry, _i, e) => setHoveredSlice({ key: entry.key, value: entry.value, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                {statusBreakdown.map(d => <Cell key={d.key} fill={STATUS_CHART_COLOR[d.key]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Custom tooltip — recharts' built-in Pie tooltip snaps to a fixed
              anchor per slice instead of following the cursor, which read as
              laggy/jumpy. This tracks the real cursor position instead and
              sits just to its right, with no fade/pop animation. */}
          {hoveredSlice && (
            <div
              className="fixed z-50 pointer-events-none px-3 py-2 rounded-xl border border-h-border bg-h-surface shadow-modal"
              style={{ left: hoveredSlice.x + 14, top: hoveredSlice.y - 14 }}
            >
              <p className="text-xs font-semibold text-h-text capitalize">{hoveredSlice.key}</p>
              <p className="text-xs text-h-text-muted">{hoveredSlice.value} prescription{hoveredSlice.value === 1 ? '' : 's'}</p>
            </div>
          )}
        </div>
        <div className="flex-1 grid grid-cols-3 gap-3 w-full">
          {['active', 'dispensed', 'flagged'].map(key => (
            <div key={key} className="text-center sm:text-left">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_CHART_COLOR[key] }} />
                <span className="text-xs text-h-text-muted capitalize">{key}</span>
              </div>
              <p className="text-lg font-bold text-h-text mt-0.5">{prescriptions.filter(rx => rx.status === key).length}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-h-text-light" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search by patient, drug or code…"
              style={searchFocused ? { borderColor:accent, boxShadow:`0 0 0 3px ${accent}25` } : {}}
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
            <div key={rx.id} id={`rx-row-${rx.id}`}
              className={`rounded-xl border px-4 py-4 transition-colors duration-700 ${
                highlightRxId === rx.id
                  ? 'border-h-blue/25'
                  : rx.flag ? 'border-h-red/25 bg-h-red-light/30' : 'border-h-border hover:border-h-blue/25'
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
