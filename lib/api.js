const RECORDS_API_BASE = "http://localhost:8000/api/records";
const CLINICAL_API_BASE = "http://localhost:8001/api/clinical";
const PHARMACY_API_BASE = "http://localhost:8002/api/pharmacy";
const ADMIN_API_BASE = "http://localhost:8004/api/admin";

export async function getPatient(patientId) {
  const response = await fetch(`${RECORDS_API_BASE}/patients/${patientId}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch patient: ${response.status}`);
  }
  return response.json();
}

export async function listPatients() {
  const response = await fetch(`${RECORDS_API_BASE}/patients`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch patients: ${response.status}`);
  }
  return response.json();
}

export async function loginStaff(email, password) {
  const response = await fetch(`${ADMIN_API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function loginPatient(email, password) {
  const response = await fetch(`${RECORDS_API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function listInstitutions(token) {
  const response = await fetch(`${ADMIN_API_BASE}/institutions`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch institutions: ${response.status}`);
  }
  return response.json();
}

export async function listAuditEvents(token) {
  const response = await fetch(`${ADMIN_API_BASE}/audit`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch audit log: ${response.status}`);
  }
  return response.json();
}

export async function checkServicesHealth(token) {
  const response = await fetch(`${ADMIN_API_BASE}/health`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch service health: ${response.status}`);
  }
  return response.json();
}

export async function listMyConsents(patientId, token) {
  const response = await fetch(`${RECORDS_API_BASE}/patients/${patientId}/consents`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch consents: ${response.status}`);
  }
  return response.json();
}

export async function listMyMedicalRecords(patientId, token) {
  const response = await fetch(`${RECORDS_API_BASE}/patients/${patientId}/medical-records`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch medical records: ${response.status}`);
  }
  return response.json();
}

export async function listMyAuditLog(patientId, token) {
  const response = await fetch(`${RECORDS_API_BASE}/patients/${patientId}/audit`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch audit log: ${response.status}`);
  }
  return response.json();
}

export async function revokeConsent(consentId, token) {
  const response = await fetch(`${RECORDS_API_BASE}/consents/${consentId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to revoke consent: ${response.status}`);
  }
  return response.json();
}

// Returns the active consent record, or null if none exists (never throws for a 404 — that's a normal "no consent" outcome).
export async function checkConsent(patientId, institutionId, token) {
  const response = await fetch(`${RECORDS_API_BASE}/consents/${patientId}?institution_id=${institutionId}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to check consent: ${response.status}`);
  }
  return response.json();
}

export async function listPatientDiagnoses(patientId, token) {
  const response = await fetch(`${CLINICAL_API_BASE}/patients/${patientId}/diagnoses`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch diagnoses: ${response.status}`);
  }
  return response.json();
}

export async function listPatientVitals(patientId, token) {
  const response = await fetch(`${CLINICAL_API_BASE}/patients/${patientId}/vitals`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch vitals: ${response.status}`);
  }
  return response.json();
}

export async function createDiagnosis(payload, token) {
  const response = await fetch(`${CLINICAL_API_BASE}/diagnoses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to create diagnosis: ${response.status}`);
  }
  return response.json();
}

export async function createVitals(payload, token) {
  const response = await fetch(`${CLINICAL_API_BASE}/vitals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to create vitals: ${response.status}`);
  }
  return response.json();
}

export async function listPatientPrescriptions(patientId) {
  const response = await fetch(`${PHARMACY_API_BASE}/patients/${patientId}/prescriptions`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch prescriptions: ${response.status}`);
  }
  return response.json();
}
