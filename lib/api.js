const RECORDS_API_BASE = "http://localhost:8000/api/records";
const ADMIN_API_BASE = "http://localhost:8004/api/admin";

export async function getPatient(patientId) {
  const response = await fetch(`${RECORDS_API_BASE}/patients/${patientId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch patient: ${response.status}`);
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
