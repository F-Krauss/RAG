// src/lib/storage.ts
// import { useState } from 'react';

export const LS = {
  prefix: 'rag',
  settings: 'rag.settings',
  threads: 'rag.threads',
  messages: (id: string) => `rag.messages.${id}`,
  // compatibilidad con pantallas de documentación antiguas:
  docs: 'rag.docs',
};

export function loadJSON<T>(k: string, d: T): T {
  try {
    const s = localStorage.getItem(k);
    return s ? (JSON.parse(s) as T) : d;
  } catch {
    return d;
  }
}

export function saveJSON(k: string, v: unknown) {
  localStorage.setItem(k, JSON.stringify(v));
}

export function uuid() {
  return (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// muy simple: convierte saltos de línea a <br/> para render seguro
export function mdEscape(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br/>');
}

// por si lo usas luego con backend
export function trimHistory<T>(arr: T[], limit = 20) {
  return arr.slice(-limit);
}


// src/lib/storage.ts
import type { DocItem } from './types';
// …(lo que ya tienes)…

export function getDocs(): DocItem[] {
  return loadJSON<DocItem[]>(LS.docs, []);
}

export function saveDocs(docs: DocItem[]) {
  saveJSON(LS.docs, docs);
}

/** Solo PDFs (por si quieres una vista “PDFs” genérica) */
export function getPdfDocs(): DocItem[] {
  return getDocs().filter(d => d.mime === 'application/pdf');
}

/** Solo PDFs de referencia (los que usa la IA) */
export function getRefPdfs(): DocItem[] {
  return getDocs().filter(
    d => d.mime === 'application/pdf' && (d.isReference ?? true)
  );
}
