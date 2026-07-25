import { loginStaff, loginPatient } from '@/lib/api';

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export async function loginWithCredentials(email, password) {
  const staffResult = await loginStaff(email, password);
  if (staffResult) {
    return {
      id: staffResult.staff_id,
      name: staffResult.name || email,
      email,
      role: staffResult.role,
      avatar: initials(staffResult.name || email),
      institution: staffResult.institution || null,
      token: staffResult.access_token,
    };
  }

  const patientResult = await loginPatient(email, password);
  if (patientResult) {
    return {
      id: patientResult.patient_id,
      name: patientResult.name || 'Patient',
      email,
      role: patientResult.role,
      avatar: initials(patientResult.name || 'Patient'),
      institution: null,
      token: patientResult.access_token,
    };
  }

  throw new Error('Invalid email or password.');
}
