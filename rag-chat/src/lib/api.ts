export async function postToN8N(body: any) {
  const url = import.meta.env.VITE_RAG_ENDPOINT;
  if (!url) throw new Error('VITE_RAG_ENDPOINT is not set');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(import.meta.env.VITE_RAG_API_KEY
        ? { 'X-Api-Key': import.meta.env.VITE_RAG_API_KEY }
        : {}),
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();               
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw.slice(0, 200)}`);

  try {
    return raw ? JSON.parse(raw) : { reply: '(empty response)', citations: [], threadTitle: '' };
  } catch {
    return { reply: raw || '(empty response)', citations: [], threadTitle: '' };
  }
}
