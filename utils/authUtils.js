import { login as apiLogin, setToken } from '@/lib/api';

/**
 * Turn a full name into initials for the avatar bubble,
 * since the backend doesn't return one (e.g. "Dr. Mugisha Eric" -> "ME").
 */
function initials(name = '') {
  const parts = name.replace(/^Dr\.\s*/i, '').trim().split(/\s+/);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
}

/**
 * Real login — calls the Admin Service, stores the JWT, and returns
 * a user object shaped the same way DEMO_USERS was, so every component
 * that already reads user.name / user.role / user.avatar keeps working
 * without any changes.
 */
export async function loginWithCredentials(email, password) {
  const res = await apiLogin(email, password); // { access_token, role, name, institution, institution_id }

  setToken(res.access_token);

  return {
    id: res.institution_id ? `${res.role}-${res.institution_id}` : res.role,
    name: res.name,
    email,
    role: res.role,
    institution: res.institution || null,
    avatar: initials(res.name),
  };
}
