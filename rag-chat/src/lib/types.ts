// src/lib/types.ts
export type Theme = 'light' | 'dark';
export type Lang = 'es' | 'en';

export type Attachment = {
  id: string;
  name: string;
  type: string;     // MIME (application/pdf, image/png, etc.)
  size?: number;
  b64?: string;     // contenido base64 (solo si subimos archivo)
};

export type Citation = {
  n: number;        // índice o número de referencia
  url: string;
  title?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;             // <— RAGChat lo usa como "content"
  attachments?: Attachment[];
  citations?: Citation[];
  createdAt?: number;
};

export type Settings = {
  model?: string;
  temperature?: number;
  topK?: number;
  webhookUrl?: string;         // <— RAGChat lo referencia
  apiKey?: string;             // <— RAGChat lo referencia
};

export type ThreadSummary = {
  id: string;
  title: string;
  updatedAt: number;
};

export type DocItem = {
  id: string;
  name: string;
  type: 'pdf' | 'link' | 'image' | 'other';
  url?: string;     // para links o PDFs hosteados
  b64?: string;     // para archivos cargados
  size?: number;
};

export type NavView = 'home' | 'docs' | 'history' | 'support' | 'faqs';
export type View = NavView | 'chat';

