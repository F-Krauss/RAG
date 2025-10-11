// src/lib/storage.ts
import type { Message, ThreadSummary, DocItem } from './types';

export const LS = {
  settings: 'rag.settings',
  threads:  'rag.threads',
  docs:     'rag.docs',
  messages: (id: string) => `rag.messages.${id}`, // <- función
};

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// =====================
// Helpers que faltaban
// =====================
export function mdEscape(s: string): string {
  // escapado simple para markdown
  return s.replace(/([\\`*_{}\[\]()#+\-.!])/g, '\\$1');
}

export function trimHistory(msgs: Message[], max = 40): Message[] {
  return msgs.length <= max ? msgs : msgs.slice(-max);
}

export function uuid(): string {
  return crypto.randomUUID();
}

// Base64 de archivos (para adjuntos)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = r.result as string;
      // si sólo quieres la parte base64:
      const b64 = dataUrl.split(',')[1] ?? dataUrl;
      resolve(b64);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// =====================
// Threads, mensajes y docs
// =====================
export function upsertThread(t: ThreadSummary) {
  const map = loadJSON<Record<string, ThreadSummary>>(LS.threads, {});
  map[t.id] = t;
  saveJSON(LS.threads, map);
}

export function getRecentThreads(limit = 10): ThreadSummary[] {
  const map = loadJSON<Record<string, ThreadSummary>>(LS.threads, {});
  return Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
}

export function getMessages(threadId: string): Message[] {
  return loadJSON<Message[]>(LS.messages(threadId), []);
}

export function saveMessages(threadId: string, msgs: Message[]) {
  saveJSON(LS.messages(threadId), msgs);
}

export function getDocs(): DocItem[] {
  return loadJSON<DocItem[]>(LS.docs, []);
}

export function saveDocs(docs: DocItem[]) {
  saveJSON(LS.docs, docs);
}
