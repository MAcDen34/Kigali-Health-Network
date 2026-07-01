// Simulated data — in production this would come from the 6 FastAPI
// microservices (records, clinical, pharmacy, insurance, admin, notification)
// via REST calls routed through HAProxy.

export const ROLES = {
  patient: {
    id: 'pt-2291',
    name: 'Uwase Diane',
    institution: null,
    institutionId: null,
    label: 'Patient',
  },
  doctor: {
    id: 'st-4471',
    name: 'Dr. Mugisha Eric',
    institution: 'King Faisal Hospital',
    institutionId: 'inst-kfh',
    label: 'Doctor',
  },
  nurse: {
    id: 'st-4502',
    name: 'Nurse Keza Aline',
    institution: 'King Faisal Hospital',
    institutionId: 'inst-kfh',
    label: 'Nurse',
  },
  pharmacist: {
    id: 'st-7710',
    name: 'Niyonsenga Patrick',
    institution: 'Kigali Pharmacy — Kimironko',
    institutionId: 'inst-pharm-01',
    label: 'Pharmacist',
  },
  insurance: {
    id: 'st-8801',
    name: 'Mukamana Sandrine',
    institution: 'RSSB / Mutuelle de Santé',
    institutionId: 'inst-rssb',
    label: 'Insurance Agent',
  },
  admin: {
    id: 'st-0001',
    name: 'Platform Admin',
    institution: 'Kigali Health Network — Platform',
    institutionId: 'inst-platform',
    label: 'Platform Admin',
  },
}

export const patientRecord = {
  id: 'pt-2291',
  name: 'Uwase Diane',
  dob: '1994-03-12',
  bloodGroup: 'O+',
  nationalId: '1199480012345678',
  allergies: ['Penicillin', 'Sulfa drugs'],
  phone: '+250 788 102 233',
}

export const consentGrants = [
  { id: 'c1', institution: 'King Faisal Hospital', grantedAt: '2026-05-02', status: 'active' },
  { id: 'c2', institution: 'Kigali Pharmacy — Kimironko', grantedAt: '2026-06-10', status: 'active' },
  { id: 'c3', institution: 'Legacy Clinic — Remera', grantedAt: '2026-01-15', status: 'revoked' },
]

export const auditLog = [
  { id: 'a1', actor: 'Dr. Mugisha Eric', institution: 'King Faisal Hospital', action: 'Viewed medical history', timestamp: '2026-06-29 14:32' },
  { id: 'a2', actor: 'Niyonsenga Patrick', institution: 'Kigali Pharmacy — Kimironko', action: 'Verified prescription #RX-8841', timestamp: '2026-06-29 14:40' },
  { id: 'a3', actor: 'Mukamana Sandrine', institution: 'RSSB / Mutuelle de Santé', action: 'Viewed billing record (claim #CL-2207)', timestamp: '2026-06-28 09:12' },
  { id: 'a4', actor: 'System', institution: 'Notification Service', action: 'Sent SMS alert — new prescription issued', timestamp: '2026-06-29 14:41' },
]

export const medicalHistory = [
  { id: 'm1', type: 'Diagnosis', detail: 'Hypertension — Stage 1', institution: 'King Faisal Hospital', date: '2026-06-29', doctor: 'Dr. Mugisha Eric' },
  { id: 'm2', type: 'Lab Result', detail: 'Fasting glucose: 5.4 mmol/L (normal)', institution: 'King Faisal Hospital', date: '2026-06-29', doctor: 'Dr. Mugisha Eric' },
  { id: 'm3', type: 'Vitals', detail: 'BP 138/89, HR 76 bpm, Temp 36.7°C', institution: 'King Faisal Hospital', date: '2026-06-29', doctor: 'Nurse Keza Aline' },
  { id: 'm4', type: 'Diagnosis', detail: 'Seasonal allergic rhinitis', institution: 'Legacy Clinic — Remera', date: '2026-02-03', doctor: 'Dr. Habimana J.' },
]

export const prescriptions = [
  { id: 'rx1', code: 'RX-8841', drug: 'Amlodipine 5mg', dosage: '1 tablet daily', status: 'active', doctor: 'Dr. Mugisha Eric', patient: 'Uwase Diane', date: '2026-06-29', flag: null },
  { id: 'rx2', code: 'RX-8839', drug: 'Ibuprofen 400mg', dosage: '1 tablet, every 8h as needed', status: 'dispensed', doctor: 'Dr. Mugisha Eric', patient: 'Habimana Jean', date: '2026-06-28', flag: 'interaction' },
  { id: 'rx3', code: 'RX-8836', drug: 'Metformin 500mg', dosage: '1 tablet twice daily', status: 'dispensed', doctor: 'Dr. Mugisha Eric', patient: 'Mukandayisenga A.', date: '2026-06-27', flag: null },
  { id: 'rx4', code: 'RX-8830', drug: 'Amoxicillin 500mg', dosage: '1 capsule, 3x daily', status: 'flagged', doctor: 'Dr. Habimana J.', patient: 'Uwase Diane', date: '2026-06-25', flag: 'allergy' },
]

export const clinicalPatients = [
  { id: 'p1', name: 'Uwase Diane', age: 32, lastVisit: '2026-06-29', consent: true, alerts: 1 },
  { id: 'p2', name: 'Habimana Jean', age: 45, lastVisit: '2026-06-28', consent: true, alerts: 0 },
  { id: 'p3', name: 'Mukandayisenga A.', age: 58, lastVisit: '2026-06-27', consent: true, alerts: 0 },
  { id: 'p4', name: 'Ndayisenga Eric', age: 27, lastVisit: '2026-06-20', consent: false, alerts: 0 },
]

export const claims = [
  { id: 'CL-2207', patient: 'Uwase Diane', institution: 'King Faisal Hospital', amount: 45000, status: 'pending', date: '2026-06-29', diagnosisCode: 'I10' },
  { id: 'CL-2199', patient: 'Habimana Jean', institution: 'King Faisal Hospital', amount: 22000, status: 'approved', date: '2026-06-26', diagnosisCode: 'J30.1' },
  { id: 'CL-2188', patient: 'Mukandayisenga A.', institution: 'Legacy Clinic — Remera', amount: 61500, status: 'paid', date: '2026-06-18', diagnosisCode: 'E11' },
  { id: 'CL-2180', patient: 'Ndayisenga Eric', institution: 'King Faisal Hospital', amount: 15000, status: 'rejected', date: '2026-06-12', diagnosisCode: 'M54.5' },
]

export const institutions = [
  { id: 'inst-kfh', name: 'King Faisal Hospital', type: 'Hospital', staff: 142, status: 'active', joined: '2025-09-01' },
  { id: 'inst-pharm-01', name: 'Kigali Pharmacy — Kimironko', type: 'Pharmacy', staff: 6, status: 'active', joined: '2025-11-12' },
  { id: 'inst-rssb', name: 'RSSB / Mutuelle de Santé', type: 'Insurance', staff: 18, status: 'active', joined: '2025-09-01' },
  { id: 'inst-clinic-02', name: 'Legacy Clinic — Remera', type: 'Clinic', staff: 9, status: 'pending', joined: '2026-06-25' },
]

export const systemHealth = [
  { service: 'Records & Consent', port: 8000, status: 'healthy', latency: 38 },
  { service: 'Clinical Service', port: 8001, status: 'healthy', latency: 44 },
  { service: 'Pharmacy Service', port: 8002, status: 'healthy', latency: 31 },
  { service: 'Insurance Service', port: 8003, status: 'degraded', latency: 210 },
  { service: 'Admin Service', port: 8004, status: 'healthy', latency: 27 },
  { service: 'Notification Service', port: 8005, status: 'healthy', latency: 19 },
]

export const platformAudit = [
  { id: 'pa1', actor: 'Dr. Mugisha Eric', institution: 'King Faisal Hospital', action: 'Viewed patient record — pt-2291', timestamp: '2026-06-29 14:32' },
  { id: 'pa2', actor: 'Platform Admin', institution: 'Platform', action: 'Issued API token for Legacy Clinic — Remera', timestamp: '2026-06-25 11:02' },
  { id: 'pa3', actor: 'Niyonsenga Patrick', institution: 'Kigali Pharmacy — Kimironko', action: 'Flagged interaction on RX-8839', timestamp: '2026-06-28 16:05' },
  { id: 'pa4', actor: 'Mukamana Sandrine', institution: 'RSSB / Mutuelle de Santé', action: 'Approved claim CL-2199', timestamp: '2026-06-26 10:44' },
]
