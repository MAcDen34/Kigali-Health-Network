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
