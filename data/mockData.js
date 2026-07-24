// ── Patient data ──────────────────────────────────────────────────────────
export const patientProfile = {
  id: 'PT-2291', name: 'Uwase Diane', dob: '1994-03-12', bloodGroup: 'O+',
  nationalId: '1 1994 8 0012345 6 78', allergies: ['Penicillin','Sulfa drugs'],
  phone: '+250 788 102 233', address: 'Gasabo, Kigali',
};

export const consentGrants = [
  { id:'C1', institution:'King Faisal Hospital',         type:'Hospital',  grantedAt:'2026-05-02', status:'active' },
  { id:'C2', institution:'Kigali Pharmacy — Kimironko',  type:'Pharmacy',  grantedAt:'2026-06-10', status:'active' },
  { id:'C3', institution:'Legacy Clinic — Remera',       type:'Clinic',    grantedAt:'2026-01-15', status:'revoked' },
];

export const medicalHistory = [
  { id:'M1', patient:'Uwase Diane',        type:'Diagnosis',  detail:'Hypertension — Stage 1',                institution:'King Faisal Hospital',   date:'2026-06-29', doctor:'Dr. Mugisha Eric',  icdCode:'I10' },
  { id:'M2', patient:'Uwase Diane',        type:'Lab Result', detail:'Fasting glucose: 5.4 mmol/L (normal)',  institution:'King Faisal Hospital',   date:'2026-06-29', doctor:'Dr. Mugisha Eric',  icdCode:'' },
  { id:'M3', patient:'Uwase Diane',        type:'Vitals',     detail:'BP 138/89 · HR 76 bpm · Temp 36.7°C',   institution:'King Faisal Hospital',   date:'2026-06-29', doctor:'Nurse Keza Aline',  icdCode:'' },
  { id:'M4', patient:'Habimana Jean',      type:'Diagnosis',  detail:'Seasonal allergic rhinitis',             institution:'Legacy Clinic — Remera', date:'2026-02-03', doctor:'Dr. Habimana J.',   icdCode:'J30.1' },
  { id:'M5', patient:'Mukandayisenga A.',  type:'Diagnosis',  detail:'Type 2 Diabetes Mellitus',               institution:'King Faisal Hospital',   date:'2026-06-27', doctor:'Dr. Mugisha Eric',  icdCode:'E11' },
  { id:'M6', patient:'Mukandayisenga A.',  type:'Lab Result', detail:'HbA1c: 7.2% (elevated)',                 institution:'King Faisal Hospital',   date:'2026-06-27', doctor:'Dr. Mugisha Eric',  icdCode:'' },
  { id:'M7', patient:'Ingabire Claudette', type:'Diagnosis',  detail:'Asthma — moderate persistent',           institution:'King Faisal Hospital',   date:'2026-06-25', doctor:'Dr. Mugisha Eric',  icdCode:'J45' },
];

export const auditLog = [
  { id:'A1', actor:'Dr. Mugisha Eric',    institution:'King Faisal Hospital',        action:'Viewed medical history',           timestamp:'2026-06-29 14:32' },
  { id:'A2', actor:'Niyonsenga Patrick',  institution:'Kigali Pharmacy — Kimironko', action:'Verified prescription RX-8841',    timestamp:'2026-06-29 14:40' },
  { id:'A3', actor:'Mukamana Sandrine',   institution:'RSSB / Mutuelle de Santé',    action:'Viewed billing record CL-2207',    timestamp:'2026-06-28 09:12' },
  { id:'A4', actor:'System',              institution:'Notification Service',        action:'SMS alert sent — new prescription',timestamp:'2026-06-29 14:41' },
];

// ── Clinical data ─────────────────────────────────────────────────────────
export const clinicPatients = [
  { id:'P1', name:'Uwase Diane',         age:32, lastVisit:'2026-06-29', consent:true,  alerts:1, bloodGroup:'O+',  diagnosis:'Hypertension' },
  { id:'P2', name:'Habimana Jean',       age:45, lastVisit:'2026-06-28', consent:true,  alerts:0, bloodGroup:'A+',  diagnosis:'Allergic rhinitis' },
  { id:'P3', name:'Mukandayisenga A.',   age:58, lastVisit:'2026-06-27', consent:true,  alerts:0, bloodGroup:'B+',  diagnosis:'Type 2 Diabetes' },
  { id:'P4', name:'Ndayisenga Eric',     age:27, lastVisit:'2026-06-20', consent:false, alerts:0, bloodGroup:'AB-', diagnosis:'—' },
  { id:'P5', name:'Ingabire Claudette',  age:36, lastVisit:'2026-06-25', consent:true,  alerts:1, bloodGroup:'O-',  diagnosis:'Asthma' },
];

// ── Prescriptions ─────────────────────────────────────────────────────────
export const prescriptions = [
  { id:'RX1', code:'RX-8841', drug:'Amlodipine 5mg',     dosage:'1 tablet daily',            status:'active',    patient:'Uwase Diane',        doctor:'Dr. Mugisha Eric',  date:'2026-06-29', flag:null },
  { id:'RX2', code:'RX-8839', drug:'Ibuprofen 400mg',    dosage:'1 tablet every 8h as needed',status:'dispensed', patient:'Habimana Jean',      doctor:'Dr. Mugisha Eric',  date:'2026-06-28', flag:'interaction' },
  { id:'RX3', code:'RX-8836', drug:'Metformin 500mg',    dosage:'1 tablet twice daily',       status:'dispensed', patient:'Mukandayisenga A.',  doctor:'Dr. Mugisha Eric',  date:'2026-06-27', flag:null },
  { id:'RX4', code:'RX-8830', drug:'Amoxicillin 500mg',  dosage:'1 capsule 3× daily',         status:'flagged',   patient:'Uwase Diane',        doctor:'Dr. Habimana J.',   date:'2026-06-25', flag:'allergy' },
  { id:'RX5', code:'RX-8825', drug:'Salbutamol Inhaler', dosage:'2 puffs every 4-6h',         status:'active',    patient:'Ingabire Claudette', doctor:'Dr. Mugisha Eric',  date:'2026-06-24', flag:null },
];

// ── Claims ────────────────────────────────────────────────────────────────
export const claims = [
  { id:'CL-2207', patient:'Uwase Diane',        institution:'King Faisal Hospital',        amount:45000, status:'pending',  date:'2026-06-29', diagCode:'I10',   service:'Consultation + labs' },
  { id:'CL-2199', patient:'Habimana Jean',       institution:'King Faisal Hospital',        amount:22000, status:'approved', date:'2026-06-26', diagCode:'J30.1', service:'Outpatient consultation' },
  { id:'CL-2188', patient:'Mukandayisenga A.',   institution:'Legacy Clinic — Remera',      amount:61500, status:'paid',     date:'2026-06-18', diagCode:'E11',   service:'Diabetes management' },
  { id:'CL-2180', patient:'Ndayisenga Eric',     institution:'King Faisal Hospital',        amount:15000, status:'rejected', date:'2026-06-12', diagCode:'M54.5', service:'Physiotherapy' },
  { id:'CL-2171', patient:'Ingabire Claudette',  institution:'King Faisal Hospital',        amount:38000, status:'pending',  date:'2026-06-10', diagCode:'J45',   service:'Asthma management' },
];

// ── Institutions ──────────────────────────────────────────────────────────
export const institutions = [
  { id:'I1', name:'King Faisal Hospital',        type:'Hospital',  staff:142, status:'active',  joined:'2025-09-01', apiToken:'tok_kfh_****' },
  { id:'I2', name:'Kigali Pharmacy — Kimironko', type:'Pharmacy',  staff:6,   status:'active',  joined:'2025-11-12', apiToken:'tok_phm_****' },
  { id:'I3', name:'RSSB / Mutuelle de Santé',    type:'Insurance', staff:18,  status:'active',  joined:'2025-09-01', apiToken:'tok_rssb_****' },
  { id:'I4', name:'Legacy Clinic — Remera',      type:'Clinic',    staff:9,   status:'pending', joined:'2026-06-25', apiToken:'—' },
];

// ── System health ─────────────────────────────────────────────────────────
export const serviceHealth = [
  { name:'Records & Consent', port:8000, status:'healthy',  latency:38,  uptime:'99.9%' },
  { name:'Clinical Service',  port:8001, status:'healthy',  latency:44,  uptime:'99.8%' },
  { name:'Pharmacy Service',  port:8002, status:'healthy',  latency:31,  uptime:'100%' },
  { name:'Insurance Service', port:8003, status:'degraded', latency:210, uptime:'97.2%' },
  { name:'Admin Service',     port:8004, status:'healthy',  latency:27,  uptime:'99.9%' },
  { name:'Notification',      port:8005, status:'healthy',  latency:19,  uptime:'99.7%' },
];

// ── Notifications ─────────────────────────────────────────────────────────
// Each entry carries the role it's meant for — notifications are per-user
// data just like medical history, so they're filtered by role before display
// (see NotificationsPage / Header) rather than shown to everyone regardless
// of who's signed in.
export const notifications = [
  { id:'N1', role:'PATIENT',         title:'New prescription issued',    body:'Amlodipine 5mg prescribed for Uwase Diane',      time:'14:41', read:false, type:'prescription' },
  { id:'N2', role:'PATIENT',         title:'Consent revoked',            body:'Uwase Diane revoked access for Legacy Clinic',   time:'13:20', read:false, type:'consent' },
  { id:'N6', role:'PATIENT',         title:'Medication reminder',        body:'Time to take Amlodipine 5mg — 1 tablet daily',   time:'08:00', read:false, type:'reminder' },
  { id:'N3', role:'INSURANCE_AGENT', title:'Claim CL-2199 approved',     body:'Habimana Jean — RWF 22,000 approved by RSSB',   time:'10:44', read:true,  type:'claim' },
  { id:'N4', role:'PHARMACIST',      title:'Drug interaction flagged',   body:'Ibuprofen + Warfarin conflict on RX-8839',       time:'09:05', read:true,  type:'alert' },
  { id:'N5', role:'PLATFORM_ADMIN',  title:'Insurance Service degraded', body:'Response latency at 210ms — investigate',        time:'08:30', read:false, type:'system' },
];

// ── Platform audit ────────────────────────────────────────────────────────
export const platformAudit = [
  { id:'PA1', actor:'Dr. Mugisha Eric',    institution:'King Faisal Hospital',        action:'Viewed patient record PT-2291', timestamp:'2026-06-29 14:32' },
  { id:'PA2', actor:'Platform Admin',      institution:'Platform',                    action:'Issued API token — Legacy Clinic',timestamp:'2026-06-25 11:02' },
  { id:'PA3', actor:'Niyonsenga Patrick',  institution:'Kigali Pharmacy — Kimironko', action:'Flagged interaction on RX-8839', timestamp:'2026-06-28 16:05' },
  { id:'PA4', actor:'Mukamana Sandrine',   institution:'RSSB / Mutuelle de Santé',    action:'Approved claim CL-2199',         timestamp:'2026-06-26 10:44' },
];
