const RECORDS_API_BASE = "http://localhost:8000/api/records";

export async function getPatient(patientId) {
  const response = await fetch(`${RECORDS_API_BASE}/patients/${patientId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch patient: ${response.status}`);
  }
  return response.json();
}
