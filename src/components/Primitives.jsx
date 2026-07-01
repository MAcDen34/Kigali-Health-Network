export function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] border-[var(--color-border)]',
    brand: 'bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)] border-transparent',
    success: 'bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)] border-transparent',
    warning: 'bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-[var(--color-warning)] border-transparent',
    danger: 'bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-[var(--color-danger)] border-transparent',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Card({ children, className = '', as: Comp = 'div', ...rest }) {
  return (
    <Comp className={`card p-5 ${className}`} {...rest}>
      {children}
    </Comp>
  )
}

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-accent)] mb-1">{eyebrow}</p>
        )}
        <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--color-text)]">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function StatTile({ label, value, sub, tone = 'neutral' }) {
  const dotTones = {
    neutral: 'bg-[var(--color-text-faint)]',
    brand: 'bg-[var(--color-brand)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    danger: 'bg-[var(--color-danger)]',
  }
  return (
    <Card className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotTones[tone]}`} />
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">{value}</p>
      {sub && <p className="text-xs text-faint">{sub}</p>}
    </Card>
  )
}
