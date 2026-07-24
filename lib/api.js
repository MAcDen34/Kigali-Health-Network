const RECORDS_API_BASE  = process.env.NEXT_PUBLIC_RECORDS_API  || "http://localhost:8000/api/records";
const CLINICAL_API_BASE = process.env.NEXT_PUBLIC_CLINICAL_API || "http://localhost:8001/api/clinical";
const PHARMACY_API_BASE = process.env.NEXT_PUBLIC_PHARMACY_API || "http://localhost:8002/api/pharmacy";
const ADMIN_API_BASE    = process.env.NEXT_PUBLIC_ADMIN_API    || "http://localhost:8004/api/admin";

const TOKEN_KEY = "kuprin_token";

/** Read the JWT saved at login. Returns null if not logged in. */
function getToken() {
  if (typeof window === "undefined") return null; // guards against server-side calls
  return sessionStorage.getItem(TOKEN_KEY);
}

/** Save the JWT returned by POST /api/admin/auth/login. */
export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

/** Clear the JWT on logout. */
export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * One shared request function every API call below is built on.
 * - Attaches the Bearer token automatically when one exists.
 * - Throws a real Error with a useful message on any non-2xx response,
 *   so callers can just try/catch instead of checking response.ok everywhere.
 */
async function request(url, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const errBody = await response.json();
      detail = errBody.detail || detail;
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    throw new Error(`${response.status}: ${detail}`);
  }

  // 204 No Content (e.g. some DELETE endpoints) has no body to parse
  if (response.status === 204) return null;
  return response.json();
}

/* ======================================================================
   AUTH  —  Admin & Platform Service
   ====================================================================== */

/** POST /api/admin/auth/login — returns { access_token, token_type, ... } */
export function login(email, password) {
  return request(`${ADMIN_API_BASE}/auth/login`, {
    method: "POST",
    body: { email, password },
    auth: false, // no token exists yet at login time
  });
}

/** GET /api/admin/auth/me — current logged-in staff profile from the token */
export function getCurrentUser() {
  return request(`${ADMIN_API_BASE}/auth/me`);
}

/* ======================================================================
   PATIENTS & CONSENT  —  Records & Consent Service
   ====================================================================== */

export function createPatient(patientData) {
  return request(`${RECORDS_API_BASE}/patients`, {
    method: "POST",
    body: patientData,
  });
}

export function getPatient(patientId) {
  return request(`${RECORDS_API_BASE}/patients/${patientId}`);
}

export function createConsent(patientId, institutionId) {
  return request(`${RECORDS_API_BASE}/consents`, {
    method: "POST",
    body: { patient_id: patientId, institution_id: institutionId },
  });
}

/** Check whether active consent exists between a patient and institution. */
export function getConsent(patientId) {
  return request(`${RECORDS_API_BASE}/consents/${patientId}`);
}

export function revokeConsent(consentId) {
  return request(`${RECORDS_API_BASE}/consents/${consentId}`, {
    method: "DELETE",
  });
}

/* ======================================================================
   MEDICAL RECORDS  —  Records & Consent Service
   ====================================================================== */

export function createMedicalRecord(recordData) {
  return request(`${RECORDS_API_BASE}/medical_records`, {
    method: "POST",
    body: recordData,
  });
}

export function getMedicalRecord(recordId) {
  return request(`${RECORDS_API_BASE}/medical_records/${recordId}`);
}

/* ======================================================================
   DIAGNOSES, VITALS, PRESCRIPTIONS  —  Clinical Service
   ====================================================================== */

export function createDiagnosis(diagnosisData) {
  return request(`${CLINICAL_API_BASE}/diagnoses`, {
    method: "POST",
    body: diagnosisData,
  });
}

export function getDiagnosis(diagnosisId) {
  return request(`${CLINICAL_API_BASE}/diagnoses/${diagnosisId}`);
}

export function getPatientDiagnoses(patientId) {
  return request(`${CLINICAL_API_BASE}/patients/${patientId}/diagnoses`);
}

export function recordVitals(vitalsData) {
  return request(`${CLINICAL_API_BASE}/vitals`, {
    method: "POST",
    body: vitalsData,
  });
}

export function getPatientVitals(patientId) {
  return request(`${CLINICAL_API_BASE}/patients/${patientId}/vitals`);
}

export function createPrescription(prescriptionData) {
  return request(`${CLINICAL_API_BASE}/prescriptions`, {
    method: "POST",
    body: prescriptionData,
  });
}

export function getPrescription(rxId) {
  return request(`${CLINICAL_API_BASE}/prescriptions/${rxId}`);
}

export function getPatientPrescriptions(patientId) {
  return request(`${CLINICAL_API_BASE}/patients/${patientId}/prescriptions`);
}

export function cancelPrescription(rxId) {
  return request(`${CLINICAL_API_BASE}/prescriptions/${rxId}/cancel`, {
    method: "PATCH",
  });
}

/* ======================================================================
   DISPENSING & INTERACTION FLAGS  —  Pharmacy Service
   ====================================================================== */

export function createDispensingRecord(dispensingData) {
  return request(`${PHARMACY_API_BASE}/dispensing`, {
    method: "POST",
    body: dispensingData,
  });
}

export function getDispensingRecord(dispensingId) {
  return request(`${PHARMACY_API_BASE}/dispensing/${dispensingId}`);
}

export function getInteractionFlag(flagId) {
  return request(`${PHARMACY_API_BASE}/interaction_flags/${flagId}`);
}

/* ======================================================================
   STAFF & INSTITUTIONS  —  Admin & Platform Service
   ====================================================================== */

export function listStaff() {
  return request(`${ADMIN_API_BASE}/staff`);
}

export function createStaff(staffData) {
  return request(`${ADMIN_API_BASE}/staff`, {
    method: "POST",
    body: staffData,
  });
}

export function getStaff(staffId) {
  return request(`${ADMIN_API_BASE}/staff/${staffId}`);
}

export function updateStaff(staffId, updates) {
  return request(`${ADMIN_API_BASE}/staff/${staffId}`, {
    method: "PATCH",
    body: updates,
  });
}

export function deactivateStaff(staffId) {
  return request(`${ADMIN_API_BASE}/staff/${staffId}`, {
    method: "DELETE",
  });
}

export function resetStaffPassword(staffId) {
  return request(`${ADMIN_API_BASE}/staff/${staffId}/reset-password`, {
    method: "POST",
  });
}

export function listInstitutions() {
  return request(`${ADMIN_API_BASE}/institutions`);
}

export function onboardInstitution(institutionData) {
  return request(`${ADMIN_API_BASE}/institutions`, {
    method: "POST",
    body: institutionData,
  });
}

export function getInstitution(institutionId) {
  return request(`${ADMIN_API_BASE}/institutions/${institutionId}`);
}

export function updateInstitution(institutionId, updates) {
  return request(`${ADMIN_API_BASE}/institutions/${institutionId}`, {
    method: "PATCH",
    body: updates,
  });
}

export function issueApiToken(institutionId) {
  return request(`${ADMIN_API_BASE}/institutions/${institutionId}/token`, {
    method: "POST",
  });
}

export function revokeApiToken(institutionId) {
  return request(`${ADMIN_API_BASE}/institutions/${institutionId}/token`, {
    method: "DELETE",
  });
}

/* ======================================================================
   PLATFORM AUDIT  —  Admin & Platform Service
   ====================================================================== */

export function listAudit(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`${ADMIN_API_BASE}/audit${query ? `?${query}` : ""}`);
}

export function getAuditStats() {
  return request(`${ADMIN_API_BASE}/audit/stats`);
}