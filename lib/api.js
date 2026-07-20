/**
 * lib/api.js — Frontend API client for KUNRN
 *
 * All calls go through this file. Token is read from sessionStorage
 * (set by AppContext on login). Every request includes:
 *   Authorization: Bearer <token>
 *
 * Base URLs map to the services running behind Docker Compose:
 *   Records Service  → localhost:8000  (/api/records/*)
 *   Clinical Service → localhost:8001  (/api/clinical/*)
 *   Admin Service    → localhost:8004  (/api/admin/*)
 *
 * To use in a page component:
 *   import { getPatient, listPatients, createDiagnosis } from '@/lib/api';
 */

const RECORDS  = "http://localhost:8000";
const CLINICAL = "http://localhost:8001";
const ADMIN    = "http://localhost:8004";

// ── Auth helper ────────────────────────────────────────────────────────────

function getToken() {
  try {
    const session = JSON.parse(sessionStorage.getItem("kunrn_session") || "{}");
    return session?.access_token || null;
  } catch {
    return null;
  }
}

async function apiFetch(baseUrl, path, options = {}) {
  const token = getToken();
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Auth ───────────────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 * Returns { access_token, role, name, institution_id, institution }
 * Store the result in AppContext — the token is needed for every other call.
 *
 * POST /api/records/auth/login
 */
export async function login(email, password) {
  return apiFetch(RECORDS, "/api/records/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ── Patients (Records Service) ─────────────────────────────────────────────

/** GET /api/records/patients — list all patients (Admin, Doctor, Nurse) */
export async function listPatients(skip = 0, limit = 50) {
  return apiFetch(RECORDS, `/api/records/patients?skip=${skip}&limit=${limit}`);
}

/** GET /api/records/patients/:id */
export async function getPatient(patientId) {
  return apiFetch(RECORDS, `/api/records/patients/${patientId}`);
}

/** POST /api/records/patients — register new patient (Admin only) */
export async function createPatient(data) {
  return apiFetch(RECORDS, "/api/records/patients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** GET /api/records/patients/:id/medical_records — consent-gated */
export async function getPatientMedicalRecords(patientId) {
  return apiFetch(RECORDS, `/api/records/patients/${patientId}/medical_records`);
}

/** GET /api/records/patients/:id/consents */
export async function getPatientConsents(patientId, activeOnly = false) {
  return apiFetch(RECORDS, `/api/records/patients/${patientId}/consents?active_only=${activeOnly}`);
}

/** GET /api/records/patients/:id/audit */
export async function getPatientAudit(patientId) {
  return apiFetch(RECORDS, `/api/records/patients/${patientId}/audit`);
}

// ── Consent (Records Service) ──────────────────────────────────────────────

/** POST /api/records/consents — grant consent */
export async function grantConsent(patientId, institutionId) {
  return apiFetch(RECORDS, "/api/records/consents", {
    method: "POST",
    body: JSON.stringify({ patient_id: patientId, institution_id: institutionId }),
  });
}

/** DELETE /api/records/consents/:id — revoke consent */
export async function revokeConsent(consentId) {
  return apiFetch(RECORDS, `/api/records/consents/${consentId}`, { method: "DELETE" });
}

// ── Medical Records (Records Service) ─────────────────────────────────────

/** POST /api/records/medical_records */
export async function createMedicalRecord(data) {
  return apiFetch(RECORDS, "/api/records/medical_records", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Clinical — Diagnoses ───────────────────────────────────────────────────

/** GET /api/clinical/patients/:id/diagnoses — consent-gated */
export async function getPatientDiagnoses(patientId) {
  return apiFetch(CLINICAL, `/api/clinical/patients/${patientId}/diagnoses`);
}

/** POST /api/clinical/diagnoses — Doctor only */
export async function createDiagnosis(data) {
  return apiFetch(CLINICAL, "/api/clinical/diagnoses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Clinical — Vitals ──────────────────────────────────────────────────────

/** GET /api/clinical/patients/:id/vitals */
export async function getPatientVitals(patientId) {
  return apiFetch(CLINICAL, `/api/clinical/patients/${patientId}/vitals`);
}

/** POST /api/clinical/vitals — Doctor or Nurse */
export async function recordVitals(data) {
  return apiFetch(CLINICAL, "/api/clinical/vitals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Clinical — Prescriptions ───────────────────────────────────────────────

/** GET /api/clinical/patients/:id/prescriptions */
export async function getPatientPrescriptions(patientId) {
  return apiFetch(CLINICAL, `/api/clinical/patients/${patientId}/prescriptions`);
}

/** POST /api/clinical/prescriptions — Doctor only. Fires Redis event. */
export async function createPrescription(data) {
  return apiFetch(CLINICAL, "/api/clinical/prescriptions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** PATCH /api/clinical/prescriptions/:id/cancel */
export async function cancelPrescription(rxId) {
  return apiFetch(CLINICAL, `/api/clinical/prescriptions/${rxId}/cancel`, { method: "PATCH" });
}

// ── Admin — Institutions ───────────────────────────────────────────────────

/** GET /api/admin/institutions */
export async function listInstitutions() {
  return apiFetch(ADMIN, "/api/admin/institutions");
}

/** POST /api/admin/institutions */
export async function createInstitution(data) {
  return apiFetch(ADMIN, "/api/admin/institutions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** PATCH /api/admin/institutions/:id */
export async function updateInstitution(id, data) {
  return apiFetch(ADMIN, `/api/admin/institutions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** POST /api/admin/institutions/:id/token — issue / rotate API token */
export async function issueApiToken(institutionId) {
  return apiFetch(ADMIN, `/api/admin/institutions/${institutionId}/token`, { method: "POST" });
}

/** DELETE /api/admin/institutions/:id/token */
export async function revokeApiToken(institutionId) {
  return apiFetch(ADMIN, `/api/admin/institutions/${institutionId}/token`, { method: "DELETE" });
}

// ── Admin — Staff ──────────────────────────────────────────────────────────

/** GET /api/admin/staff */
export async function listStaff() {
  return apiFetch(ADMIN, "/api/admin/staff");
}

/** POST /api/admin/staff — create doctor, nurse, pharmacist, etc. */
export async function createStaff(data) {
  return apiFetch(ADMIN, "/api/admin/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** PATCH /api/admin/staff/:id */
export async function updateStaff(id, data) {
  return apiFetch(ADMIN, `/api/admin/staff/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** DELETE /api/admin/staff/:id — soft deactivate */
export async function deactivateStaff(id) {
  return apiFetch(ADMIN, `/api/admin/staff/${id}`, { method: "DELETE" });
}

/** POST /api/admin/staff/:id/reset-password */
export async function resetStaffPassword(id, newPassword) {
  return apiFetch(ADMIN, `/api/admin/staff/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ new_password: newPassword }),
  });
}

// ── Admin — Audit & Stats ──────────────────────────────────────────────────

/** GET /api/admin/audit */
export async function getPlatformAudit(skip = 0, limit = 50) {
  return apiFetch(ADMIN, `/api/admin/audit?skip=${skip}&limit=${limit}`);
}

/** GET /api/admin/audit/stats — dashboard KPI counts */
export async function getAdminStats() {
  return apiFetch(ADMIN, "/api/admin/audit/stats");
}
