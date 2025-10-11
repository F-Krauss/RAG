import React from 'react';
import type { DocItem } from '../lib/types';
import { getDocs, saveDocs } from '../lib/storage';

export default function DocsView() {
  const [docs, setDocs] = React.useState<DocItem[]>(getDocs());
  const [link, setLink] = React.useState('');
  const [name, setName] = React.useState('');

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf');
    const now = Date.now();
    const added: DocItem[] = files.map(f => ({
      id: crypto.randomUUID(),
      kind: 'pdf',
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
      createdAt: now,
    }));
    const next = [...added, ...docs];
    setDocs(next); saveDocs(next);
    e.target.value = '';
  }

  function onAddLink() {
    if (!link) return;
    const next: DocItem[] = [{ id: crypto.randomUUID(), kind:'link', name: name || link, href: link, createdAt: Date.now() }, ...docs];
    setDocs(next); saveDocs(next); setLink(''); setName('');
  }

  function remove(id: string) {
    const next = docs.filter(d=>d.id!==id);
    setDocs(next); saveDocs(next);
  }

  return (
    <div className="h-full p-4 overflow-auto space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="px-3 py-2 rounded border cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
          📄 Subir PDFs
          <input type="file" accept="application/pdf" multiple onChange={onFiles} className="hidden" />
        </label>
        <div className="flex items-center gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Título opcional"
                 className="px-3 py-2 rounded border bg-transparent" />
          <input value={link} onChange={e=>setLink(e.target.value)} placeholder="https://…" 
                 className="px-3 py-2 rounded border bg-transparent w-80" />
          <button onClick={onAddLink} className="px-3 py-2 rounded border hover:bg-slate-100 dark:hover:bg-slate-800">
            ➕ Añadir enlace
          </button>
        </div>
      </div>

      <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {docs.map(d=>(
          <li key={d.id} className="p-3 rounded border hover:bg-slate-50 dark:hover:bg-slate-800/40">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{d.kind==='pdf'?'📄':'🔗'}</div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{d.name}</div>
                <div className="text-xs opacity-60">
                  {d.kind==='pdf' ? `${(d.size/1024/1024).toFixed(2)} MB` : (d.href)}
                </div>
                <div className="mt-2 flex gap-2">
                  {d.kind==='pdf'
                    ? <a href={d.url} target="_blank" className="text-sm underline">Ver</a>
                    : <a href={d.href} target="_blank" className="text-sm underline">Abrir</a>}
                  <button onClick={()=>remove(d.id)} className="text-sm text-red-600 hover:underline">Eliminar</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
