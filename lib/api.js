const RECORDS_API_BASE = "http://localhost:8000/api/records";
const CLINICAL_API_BASE = "http://localhost:8001/api/clinical";
const PHARMACY_API_BASE = "http://localhost:8002/api/pharmacy";
const ADMIN_API_BASE = "http://localhost:8004/api/admin";
const INSURANCE_API_BASE = "http://localhost:8003/api/insurance";

export async function getPatient(patientId) {
  const response = await fetch(`${RECORDS_API_BASE}/patients/${patientId}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch patient: ${response.status}`);
  }
  return response.json();
}

export async function listPatients(token) {
  const response = await fetch(`${RECORDS_API_BASE}/patients`, {
    headers: { "Authorization": `Bearer ${token}` },
    cache: "no-store",
  });
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

export async function grantConsent(patientId, institutionId, token) {
  const response = await fetch(`${RECORDS_API_BASE}/consents`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ patient_id: patientId, institution_id: institutionId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to grant consent: ${response.status}`);
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

export async function listPatientPrescriptions(patientId, token) {
  const response = await fetch(`${PHARMACY_API_BASE}/patients/${patientId}/prescriptions`, {
    headers: { "Authorization": `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch prescriptions: ${response.status}`);
  }
  return response.json();
}

export async function listAllPrescriptions(token) {
  const response = await fetch(`${PHARMACY_API_BASE}/prescriptions`, {
    headers: { "Authorization": `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch prescriptions: ${response.status}`);
  }
  return response.json();
}

export async function listAllInteractionFlags(token) {
  const response = await fetch(`${PHARMACY_API_BASE}/interaction_flags`, {
    headers: { "Authorization": `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch interaction flags: ${response.status}`);
  }
  return response.json();
}

export async function createPrescription(recordId, doctorId, drugCode, dosage, patientId, token) {
  const response = await fetch(`${PHARMACY_API_BASE}/prescriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ record_id: recordId, doctor_id: doctorId, drug_code: drugCode, dosage, patient_id: patientId }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Failed to create prescription: ${response.status}`);
  return response.json();
}

export async function createMedicalRecord(patientId, type, content, token) {
  const response = await fetch(`${RECORDS_API_BASE}/medical_records`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ patient_id: patientId, type, content }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Failed to create medical record: ${response.status}`);
  return response.json();
}

export async function dispensePrescription(prescriptionId, pharmacyId, token) {
  const response = await fetch(`${PHARMACY_API_BASE}/dispensing`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ prescription_id: prescriptionId, pharmacy_id: pharmacyId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to dispense prescription: ${response.status}`);
  }
  return response.json();
}

export async function listStaff(token) {
  const response = await fetch(`${ADMIN_API_BASE}/staff`, {
    headers: { "Authorization": `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch staff: ${response.status}`);
  }
  return response.json();
}

export async function createStaff(payload, token) {
  const response = await fetch(`${ADMIN_API_BASE}/staff`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Failed to create staff: ${response.status}`);
  }
  return response.json();
}

export async function deactivateStaff(staffId, token) {
  const response = await fetch(`${ADMIN_API_BASE}/staff/${staffId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to deactivate staff: ${response.status}`);
  }
  return response.json();
}

export async function reactivateStaff(staffId, token) {
  const response = await fetch(`${ADMIN_API_BASE}/staff/${staffId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ active: true }),
  });
  if (!response.ok) {
    throw new Error(`Failed to reactivate staff: ${response.status}`);
  }
  return response.json();
}

export async function updateInstitution(institutionId, payload, token) {
  const response = await fetch(`${ADMIN_API_BASE}/institutions/${institutionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to update institution: ${response.status}`);
  }
  return response.json();
}

export async function createInstitution(payload, token) {
  const response = await fetch(`${ADMIN_API_BASE}/institutions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Failed to create institution: ${response.status}`);
  }
  return response.json();
}

export async function listClaims(token) {
  const response = await fetch(`${INSURANCE_API_BASE}/claims`, {
    headers: { "Authorization": `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch claims: ${response.status}`);
  }
  return response.json();
}

export async function updateClaimStatus(claimId, status, token, amount) {
  const body = amount !== undefined ? { status, amount } : { status };
  const response = await fetch(`${INSURANCE_API_BASE}/claims/${claimId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Failed to update claim: ${response.status}`);
  }
  return response.json();
}
