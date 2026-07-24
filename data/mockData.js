'use client';
import * as Icons from 'lucide-react';

const COLORS = {
  blue:   { text:'text-h-blue',   border:'border-h-blue/15' },
  teal:   { text:'text-h-teal',   border:'border-h-teal/15' },
  green:  { text:'text-h-green',  border:'border-h-green/15' },
  amber:  { text:'text-h-amber',  border:'border-h-amber/15' },
  red:    { text:'text-h-red',    border:'border-h-red/15' },
  purple: { text:'text-h-purple', border:'border-h-purple/15' },
};

export default function KPICard({ title, value, subtitle, icon, trend, trendValue, color = 'blue', onClick }) {
  const Icon = Icons[icon] || Icons.Activity;
  const c = COLORS[color] || COLORS.blue;
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border ${c.border} p-5 transition-all duration-300 hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''} group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-h-text-muted uppercase tracking-widest mb-2">{title}</p>
          <p className="text-2xl font-bold text-h-text truncate">{value}</p>
          {subtitle && <p className="text-xs text-h-text-light mt-1.5">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2.5 text-xs font-semibold ${trend === 'up' ? 'text-h-green' : 'text-h-red'}`}>
              {trend === 'up'
                ? <Icons.TrendingUp className="w-3.5 h-3.5 mr-1" />
                : <Icons.TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <Icon className={`w-5 h-5 flex-shrink-0 ${c.text} transition-transform duration-300 group-hover:scale-110`} />
      </div>
      <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full bg-current opacity-[0.03] transition-transform duration-500 group-hover:scale-150" />
    </div>
  );
}
