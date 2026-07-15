'use client';
const TONE = {
  blue:    'bg-h-blue-light text-h-blue border-h-blue/20',
  teal:    'bg-h-teal-light text-h-teal border-h-teal/20',
  green:   'bg-h-green-light text-h-green border-h-green/20',
  amber:   'bg-h-amber-light text-h-amber border-h-amber/20',
  red:     'bg-h-red-light text-h-red border-h-red/20',
  purple:  'bg-h-purple-light text-h-purple border-h-purple/20',
  gray:    'bg-h-bg text-h-text-muted border-h-border',
};
export default function Badge({ tone = 'gray', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE[tone]} ${className}`}>
      {children}
    </span>
  );
}
