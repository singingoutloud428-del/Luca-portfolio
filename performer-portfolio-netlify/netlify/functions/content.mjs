import { getStore } from '@netlify/blobs';
import { defaultContent } from '../lib/default-content.mjs';
import { isAuthenticated, json } from '../lib/auth.mjs';

const KEY = 'portfolio-content';

function cleanString(value, max = 5000) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function sanitize(data) {
  const out = structuredClone(defaultContent);
  const p = data?.profile || {};
  out.profile = {
    name: cleanString(p.name, 100), eyebrow: cleanString(p.eyebrow, 120), tagline: cleanString(p.tagline, 180),
    intro: cleanString(p.intro, 800), location: cleanString(p.location, 120), availability: cleanString(p.availability, 220),
    headshotUrl: cleanString(p.headshotUrl, 1000), headshotAlt: cleanString(p.headshotAlt, 180)
  };
  out.about = { heading: cleanString(data?.about?.heading, 100), body: cleanString(data?.about?.body, 6000) };
  out.showreel = { heading: cleanString(data?.showreel?.heading, 100), url: cleanString(data?.showreel?.url, 1500), caption: cleanString(data?.showreel?.caption, 500) };
  out.cv = { heading: cleanString(data?.cv?.heading, 100), url: cleanString(data?.cv?.url, 1500), fileName: cleanString(data?.cv?.fileName, 180), summary: cleanString(data?.cv?.summary, 500) };
  out.skills = Array.isArray(data?.skills) ? data.skills.slice(0, 40).map(v => cleanString(v, 100)).filter(Boolean) : [];
  out.credits = Array.isArray(data?.credits) ? data.credits.slice(0, 50).map(x => ({ production: cleanString(x?.production, 160), role: cleanString(x?.role, 160), company: cleanString(x?.company, 160), year: cleanString(x?.year, 30) })) : [];
  out.training = Array.isArray(data?.training) ? data.training.slice(0, 30).map(x => ({ title: cleanString(x?.title, 160), place: cleanString(x?.place, 160), detail: cleanString(x?.detail, 800) })) : [];
  out.gallery = Array.isArray(data?.gallery) ? data.gallery.slice(0, 30).map(x => ({ url: cleanString(x?.url, 1500), alt: cleanString(x?.alt, 180), caption: cleanString(x?.caption, 300) })).filter(x => x.url) : [];
  out.links = Array.isArray(data?.links) ? data.links.slice(0, 30).map(x => ({ label: cleanString(x?.label, 100), url: cleanString(x?.url, 1500) })).filter(x => x.label && x.url) : [];
  out.contact = { heading: cleanString(data?.contact?.heading, 120), text: cleanString(data?.contact?.text, 1000), email: cleanString(data?.contact?.email, 250), instagram: cleanString(data?.contact?.instagram, 500), spotlight: cleanString(data?.contact?.spotlight, 500) };
  out.site = { accent: /^#[0-9a-f]{6}$/i.test(data?.site?.accent || '') ? data.site.accent : '#9eb9d4', updatedAt: new Date().toISOString() };
  return out;
}

export default async (req) => {
  const store = getStore({ name: 'performer-portfolio', consistency: 'strong' });
  if (req.method === 'GET') {
    const saved = await store.get(KEY, { type: 'json', consistency: 'strong' });
    return json(saved || defaultContent);
  }
  if (req.method !== 'PUT') return json({ error: 'Method not allowed' }, 405);
  if (!isAuthenticated(req)) return json({ error: 'Unauthorised' }, 401);

  let incoming;
  try { incoming = await req.json(); } catch { return json({ error: 'Invalid JSON.' }, 400); }
  const clean = sanitize(incoming);
  await store.setJSON(KEY, clean);
  return json({ ok: true, content: clean });
};
