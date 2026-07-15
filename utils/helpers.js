export const generateId = (prefix = 'ID') =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

export const formatRWF = (n) => `RWF ${Number(n).toLocaleString()}`;

export const fmtDate = (d) => new Date(d).toLocaleDateString('en-RW', { day:'2-digit', month:'short', year:'numeric' });

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
