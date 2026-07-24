export const ROLES = {
  PLATFORM_ADMIN:    'Platform Administrator',
  PATIENT:           'Patient',
  DOCTOR:            'Doctor',
  NURSE:             'Nurse',
  PHARMACIST:        'Pharmacist',
  INSURANCE_AGENT:   'Insurance Agent',
};

// Notifications is reached via the header bell, not listed here.
export const ROLE_NAV = {
  PLATFORM_ADMIN:  ['dashboard','admin','audit'],
  PATIENT:         ['dashboard','records'],
  DOCTOR:          ['dashboard','clinic'],
  NURSE:           ['dashboard','clinic'],
  PHARMACIST:      ['dashboard','pharmacy'],
  INSURANCE_AGENT: ['dashboard','insurance'],
};

// Account-level pages every role may reach regardless of ROLE_NAV.
export const ALWAYS_ALLOWED_ROUTES = ['dashboard', 'profile', 'notifications'];

// Red excluded on purpose — reserved for danger/alert states, not identity.
export const ROLE_ACCENT = {
  PLATFORM_ADMIN:  '#5B4E8C',
  PATIENT:         '#358573',
  DOCTOR:          '#3E6B8A',
  NURSE:           '#5A9B5C',
  PHARMACIST:      '#CC8A38',
  INSURANCE_AGENT: '#7D5BA6',
};

export const DEMO_USERS = [
  { id:'USR001', name:'Platform Admin',       email:'admin@kuprin.rw',      password:'admin123',     role:'PLATFORM_ADMIN',  avatar:'PA', institution:'KUPRIN Platform' },
  { id:'USR002', name:'Uwase Diane',           email:'patient@kuprin.rw',    password:'patient123',   role:'PATIENT',         avatar:'UD', institution:null },
  { id:'USR003', name:'Dr. Mugisha Eric',      email:'doctor@kuprin.rw',     password:'doctor123',    role:'DOCTOR',          avatar:'ME', institution:'King Faisal Hospital' },
  { id:'USR004', name:'Nurse Keza Aline',      email:'nurse@kuprin.rw',      password:'nurse123',     role:'NURSE',           avatar:'KA', institution:'King Faisal Hospital' },
  { id:'USR005', name:'Niyonsenga Patrick',    email:'pharm@kuprin.rw',      password:'pharm123',     role:'PHARMACIST',      avatar:'NP', institution:'Kigali Pharmacy — Kimironko' },
  { id:'USR006', name:'Mukamana Sandrine',     email:'insurance@kuprin.rw',  password:'ins123',       role:'INSURANCE_AGENT', avatar:'MS', institution:'RSSB / Mutuelle de Santé' },
];
