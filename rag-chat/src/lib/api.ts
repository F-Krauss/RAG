export async function postToN8N(payload: any) {
  const endpoint = import.meta.env.VITE_RAG_ENDPOINT; // 👈 sin fallback a /api/rag-chat
  if (!endpoint) throw new Error('VITE_RAG_ENDPOINT is not set');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = import.meta.env.VITE_RAG_API_KEY;
  if (apiKey) headers['X-Api-Key'] = apiKey;

  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });

  // Defensa: si el server envía HTML (p.ej. 404 page), evita .json() y muestra mensaje claro.
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Webhook ${res.status}: ${text.slice(0, 300)}`);
  }
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`Respuesta no-JSON del webhook (content-type=${ct}). Cuerpo: ${text.slice(0, 300)}`);
  }
  return res.json();
}
