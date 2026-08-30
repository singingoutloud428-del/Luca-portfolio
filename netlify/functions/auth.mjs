import { createSessionCookie, clearSessionCookie, isAuthenticated, json, passwordConfigured, verifyPassword } from '../lib/auth.mjs';

export default async (req) => {
  if (req.method === 'GET') {
    return json({ authenticated: isAuthenticated(req), configured: passwordConfigured() });
  }

  if (req.method === 'DELETE') {
    return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!passwordConfigured()) return json({ error: 'ADMIN_PASSWORD is not configured in Netlify.' }, 503);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  if (!verifyPassword(body?.password || '')) return json({ error: 'Incorrect password.' }, 401);

  return json({ ok: true }, 200, { 'set-cookie': createSessionCookie() });
};
