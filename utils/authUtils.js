import { DEMO_USERS } from '@/data/roles';

export async function loginWithCredentials(email, password) {
  await new Promise(r => setTimeout(r, 700));
  const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error('No account found with that email address.');
  if (user.password !== password) throw new Error('Incorrect password. Please try again.');
  return user;
}
