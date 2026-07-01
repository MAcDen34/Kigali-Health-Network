/**
 * api.js — Mock API service layer
 *
 * In production this module makes real HTTP calls to the FastAPI
 * microservices via HAProxy (VITE_API_BASE_URL).
 *
 * In this prototype each function returns a resolved Promise with
 * mock data so the UI is fully wired without a running backend.
 * Swap the mock return for the fetch() call underneath to go live.
 *
 * Route map:
 *   Records & Consent  →  /api/records  (HAProxy → records-service:8000)
 *   Clinical Service   →  /api/clinical (HAProxy → clinical-service:8001)
 *   Pharmacy Service   →  /api/pharmacy (HAProxy → pharmacy-service:8002)
 *   Insurance Service  →  /api/insurance(HAProxy → insurance-service:8003)
 *   Admin Service      →  /api/admin    (HAProxy → admin-service:8004)
 *   Notification       →  /api/notify   (HAProxy → notification-service:8005)
 */

import {
  patientRecord,
  consentGrants,
  auditLog,
  medicalHistory,
  prescriptions,
  clinicalPatients,
  claims,
  institutions,
  systemHealth,
  platformAudit,
} from './mockData'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80/api'

// ── Helpers ────────────────────────────────────────────────────────────────

function delay(ms = 280) {
  return new Promise(res => setTimeout(res, ms))
}

// Live fetch helper (JWT injected from sessionStorage)
// async function apiFetch(path, options = {}) {
//   const user = JSON.parse(sessionStorage.getItem('kunp_user') || 'null')
//   const res = await fetch(`${BASE}${path}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(user ? { Authorization: `Bearer ${user.token}` } : {}),
//       ...(options.headers || {}),
//     },
//   })
//   if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
//   return res.json()
// }

// ── Records & Consent Service (/api/records) ──────────────────────────────

export async function getPatientProfile() {
  await delay()
  return patientRecord
  // return apiFetch('/records/patients/me')
}

export async function getConsentGrants() {
  await delay()
  return consentGrants
  // return apiFetch('/records/consents')
}

export async function grantConsent(institutionId) {
  await delay()
  return { success: true, institutionId }
  // return apiFetch(`/records/consents`, { method: 'POST', body: JSON.stringify({ institutionId }) })
}

export async function revokeConsent(consentId) {
  await delay()
  return { success: true, consentId }
  // return apiFetch(`/records/consents/${consentId}`, { method: 'DELETE' })
}

export async function getMedicalHistory(patientId) {
  await delay()
  return medicalHistory
  // return apiFetch(`/records/patients/${patientId}/history`)
}

export async function getAuditLog(patientId) {
  await delay()
  return auditLog
  // return apiFetch(`/records/audit?patientId=${patientId}`)
}

// ── Clinical Service (/api/clinical) ──────────────────────────────────────

export async function getClinicPatients() {
  await delay()
  return clinicalPatients
  // return apiFetch('/clinical/patients')
}

export async function createDiagnosis(payload) {
  await delay()
  return { success: true, id: `m${Date.now()}`, ...payload }
  // return apiFetch('/clinical/diagnoses', { method: 'POST', body: JSON.stringify(payload) })
}

export async function createPrescription(payload) {
  await delay()
  // Redis prescription_created event would fire here in production,
  // triggering async picks by Pharmacy, Insurance, and Notification services.
  return { success: true, id: `rx${Date.now()}`, code: `RX-${Math.floor(Math.random()*9000)+1000}`, ...payload }
  // return apiFetch('/clinical/prescriptions', { method: 'POST', body: JSON.stringify(payload) })
}

export async function recordVitals(payload) {
  await delay()
  return { success: true, id: `m${Date.now()}`, type: 'Vitals', ...payload }
  // return apiFetch('/clinical/vitals', { method: 'POST', body: JSON.stringify(payload) })
}

// ── Pharmacy Service (/api/pharmacy) ──────────────────────────────────────

export async function getPrescriptionQueue() {
  await delay()
  return prescriptions
  // return apiFetch('/pharmacy/prescriptions/queue')
}

export async function verifyPrescription(prescriptionId) {
  await delay()
  return { prescriptionId, valid: true, interactionFlags: [] }
  // return apiFetch(`/pharmacy/prescriptions/${prescriptionId}/verify`)
}

export async function markDispensed(prescriptionId) {
  await delay()
  return { success: true, prescriptionId, dispensedAt: new Date().toISOString() }
  // return apiFetch(`/pharmacy/prescriptions/${prescriptionId}/dispense`, { method: 'POST' })
}

// ── Insurance Service (/api/insurance) ────────────────────────────────────

export async function getClaims() {
  await delay()
  return claims
  // return apiFetch('/insurance/claims')
}

export async function approveClaim(claimId) {
  await delay()
  return { success: true, claimId, status: 'approved' }
  // return apiFetch(`/insurance/claims/${claimId}/approve`, { method: 'POST' })
}

export async function rejectClaim(claimId) {
  await delay()
  return { success: true, claimId, status: 'rejected' }
  // return apiFetch(`/insurance/claims/${claimId}/reject`, { method: 'POST' })
}

export async function markClaimPaid(claimId) {
  await delay()
  return { success: true, claimId, status: 'paid' }
  // return apiFetch(`/insurance/claims/${claimId}/pay`, { method: 'POST' })
}

// ── Admin Service (/api/admin) ─────────────────────────────────────────────

export async function getInstitutions() {
  await delay()
  return institutions
  // return apiFetch('/admin/institutions')
}

export async function onboardInstitution(payload) {
  await delay()
  return { success: true, id: `inst-${Date.now()}`, ...payload }
  // return apiFetch('/admin/institutions', { method: 'POST', body: JSON.stringify(payload) })
}

export async function rotateApiToken(institutionId) {
  await delay()
  return { success: true, institutionId, token: `tok_${Math.random().toString(36).slice(2)}` }
  // return apiFetch(`/admin/institutions/${institutionId}/token`, { method: 'POST' })
}

export async function getSystemHealth() {
  await delay()
  return systemHealth
  // return apiFetch('/admin/health')
}

export async function getPlatformAudit() {
  await delay()
  return platformAudit
  // return apiFetch('/admin/audit')
}
