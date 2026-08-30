import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  const key = new URL(req.url).searchParams.get('key');
  if (!key || !key.startsWith('uploads/')) return new Response('Invalid media key', { status: 400 });

  const store = getStore('performer-media');
  const meta = await store.getMetadata(key);
  if (!meta) return new Response('Not found', { status: 404 });
  const data = await store.get(key, { type: 'arrayBuffer' });
  if (!data) return new Response('Not found', { status: 404 });

  const contentType = meta.metadata?.contentType || 'application/octet-stream';
  const fileName = meta.metadata?.fileName || 'file';
  return new Response(data, {
    status: 200,
    headers: {
      'content-type': contentType,
      'content-disposition': contentType === 'application/pdf' ? `inline; filename="${fileName.replace(/"/g, '')}"` : 'inline',
      'cache-control': 'public, max-age=3600'
    }
  });
};
