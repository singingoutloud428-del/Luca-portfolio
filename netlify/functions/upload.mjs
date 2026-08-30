import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';
import { isAuthenticated, json } from '../lib/auth.mjs';

const MAX_BYTES = 4 * 1024 * 1024;
const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);

function safeName(name = 'file') {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(-120);
}

export default async (req) => {
  if (!isAuthenticated(req)) return json({ error: 'Unauthorised' }, 401);
  const store = getStore({ name: 'performer-media', consistency: 'strong' });

  if (req.method === 'DELETE') {
    const { key } = await req.json().catch(() => ({}));
    if (!key || typeof key !== 'string') return json({ error: 'Missing key.' }, 400);
    await store.delete(key);
    return json({ ok: true });
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let form;
  try { form = await req.formData(); } catch { return json({ error: 'Expected multipart/form-data.' }, 400); }
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'No file supplied.' }, 400);
  if (!allowed.has(file.type)) return json({ error: 'Only JPG, PNG, WEBP, GIF and PDF files are allowed.' }, 415);
  if (file.size > MAX_BYTES) return json({ error: 'File is too large. Maximum upload size is 4 MB.' }, 413);

  const id = crypto.randomUUID();
  const key = `uploads/${id}-${safeName(file.name)}`;
  const buffer = await file.arrayBuffer();
  await store.set(key, buffer, { metadata: { contentType: file.type, fileName: safeName(file.name), uploadedAt: new Date().toISOString() } });
  return json({ ok: true, key, url: `/api/media?key=${encodeURIComponent(key)}`, fileName: safeName(file.name), contentType: file.type });
};
