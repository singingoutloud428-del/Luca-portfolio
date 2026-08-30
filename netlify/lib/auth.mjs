import crypto from 'node:crypto';

const COOKIE_NAME = 'performer_portfolio_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_PASSWORD || '';
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

function safeEqual(a, b) {
  const aa = Buffer.from(a || '');
  const bb = Buffer.from(b || '');
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export function passwordConfigured() {
  return Boolean(secret());
}

export function verifyPassword(password) {
  return Boolean(secret()) && safeEqual(password, secret());
}

export function createSessionCookie() {
  const issued = String(Date.now());
  const token = `${issued}.${sign(issued)}`;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function getCookie(req, name) {
  const cookie = req.headers.get('cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

export function isAuthenticated(req) {
  if (!secret()) return false;
  const token = getCookie(req, COOKIE_NAME);
  if (!token) return false;
  const [issued, signature] = token.split('.');
  if (!issued || !signature) return false;
  const age = Date.now() - Number(issued);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_SECONDS * 1000) return false;
  return safeEqual(signature, sign(issued));
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });
}
