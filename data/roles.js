export const ROLES = {
  PLATFORM_ADMIN:    'Platform Administrator',
  PATIENT:           'Patient',
  DOCTOR:            'Doctor',
  NURSE:             'Nurse',
  PHARMACIST:        'Pharmacist',
  INSURANCE_AGENT:   'Insurance Agent',
};

// Nav access per role (notifications is reached via the header bell, not a sidebar entry)
export const ROLE_NAV = {
  PLATFORM_ADMIN:  ['dashboard','admin','audit'],
  PATIENT:         ['dashboard','records'],
  DOCTOR:          ['dashboard','clinic'],
  NURSE:           ['dashboard','clinic'],
  PHARMACIST:      ['dashboard','pharmacy'],
  INSURANCE_AGENT: ['dashboard','insurance'],
};

// Routes every signed-in role may reach regardless of ROLE_NAV — these are
// account-level pages (not domain nav items), reached only via the header.
export const ALWAYS_ALLOWED_ROUTES = ['dashboard', 'profile', 'notifications'];

// Accent colour per role (used for sidebar active state).
// Each role reuses the same hue as its domain's badge/KPI color elsewhere
// in the app, so the identity color always means the same thing everywhere.
// Red is intentionally excluded — it's reserved for danger/alert states only,
// so no role ever looks like it's permanently "in error".
export const ROLE_ACCENT = {
  PLATFORM_ADMIN:  '#5B4E8C', // deep plum — authority, distinct from every semantic tone
  PATIENT:         '#358573', // teal (dark variant) — health/consent
  DOCTOR:          '#3E6B8A', // blue (dark variant) — clinical/trust
  NURSE:           '#5A9B5C', // green (dark variant) — care/vitality
  PHARMACIST:      '#CC8A38', // amber — medication
  INSURANCE_AGENT: '#7D5BA6', // purple — billing/admin
};

export const DEMO_USERS = [
  { id:'USR001', name:'Platform Admin',       email:'admin@kuprin.rw',      password:'admin123',     role:'PLATFORM_ADMIN',  avatar:'PA', institution:'KUPRIN Platform' },
  { id:'USR002', name:'Uwase Diane',           email:'patient@kuprin.rw',    password:'patient123',   role:'PATIENT',         avatar:'UD', institution:null },
  { id:'USR003', name:'Dr. Mugisha Eric',      email:'doctor@kuprin.rw',     password:'doctor123',    role:'DOCTOR',          avatar:'ME', institution:'King Faisal Hospital' },
  { id:'USR004', name:'Nurse Keza Aline',      email:'nurse@kuprin.rw',      password:'nurse123',     role:'NURSE',           avatar:'KA', institution:'King Faisal Hospital' },
  { id:'USR005', name:'Niyonsenga Patrick',    email:'pharm@kuprin.rw',      password:'pharm123',     role:'PHARMACIST',      avatar:'NP', institution:'Kigali Pharmacy — Kimironko' },
  { id:'USR006', name:'Mukamana Sandrine',     email:'insurance@kuprin.rw',  password:'ins123',       role:'INSURANCE_AGENT', avatar:'MS', institution:'RSSB / Mutuelle de Santé' },
];
