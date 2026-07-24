export const ROLES = {
  PLATFORM_ADMIN:    'Platform Administrator',
  PATIENT:           'Patient',
  DOCTOR:            'Doctor',
  NURSE:             'Nurse',
  PHARMACIST:        'Pharmacist',
  INSURANCE_AGENT:   'Insurance Agent',
};

// Nav access per role
export const ROLE_NAV = {
  PLATFORM_ADMIN:  ['dashboard','admin','notifications','audit'],
  PATIENT:         ['dashboard','records','notifications'],
  DOCTOR:          ['dashboard','clinic','notifications'],
  NURSE:           ['dashboard','clinic','notifications'],
  PHARMACIST:      ['dashboard','pharmacy','notifications'],
  INSURANCE_AGENT: ['dashboard','insurance','notifications'],
};

// Accent colour per role (used for sidebar active state)
export const ROLE_ACCENT = {
  PLATFORM_ADMIN:  '#DC2626',
  PATIENT:         '#0B9B8A',
  DOCTOR:          '#1B6EF3',
  NURSE:           '#2DB37E',
  PHARMACIST:      '#E8710A',
  INSURANCE_AGENT: '#7C3AED',
};

export const DEMO_USERS = [
  { id:'USR001', name:'Platform Admin',       email:'admin@kuprin.rw',      password:'admin123',     role:'PLATFORM_ADMIN',  avatar:'PA', institution:'KUPRIN Platform' },
  { id:'USR002', name:'Uwase Diane',           email:'patient@kuprin.rw',    password:'patient123',   role:'PATIENT',         avatar:'UD', institution:null },
  { id:'USR003', name:'Dr. Mugisha Eric',      email:'doctor@kuprin.rw',     password:'doctor123',    role:'DOCTOR',          avatar:'ME', institution:'King Faisal Hospital' },
  { id:'USR004', name:'Nurse Keza Aline',      email:'nurse@kuprin.rw',      password:'nurse123',     role:'NURSE',           avatar:'KA', institution:'King Faisal Hospital' },
  { id:'USR005', name:'Niyonsenga Patrick',    email:'pharm@kuprin.rw',      password:'pharm123',     role:'PHARMACIST',      avatar:'NP', institution:'Kigali Pharmacy — Kimironko' },
  { id:'USR006', name:'Mukamana Sandrine',     email:'insurance@kuprin.rw',  password:'ins123',       role:'INSURANCE_AGENT', avatar:'MS', institution:'RSSB / Mutuelle de Santé' },
];
