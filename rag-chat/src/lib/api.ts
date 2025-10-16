export async function postToN8N(payload: any) {
  const endpoint = import.meta.env.VITE_RAG_ENDPOINT || '/api/rag-chat';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = import.meta.env.VITE_RAG_API_KEY;
  if (apiKey) headers['X-Api-Key'] = apiKey;

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 60000);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  clearTimeout(to);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Webhook ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}
