import React from 'react';
import { LS, loadJSON } from '../lib/storage';
import type { ThreadSummary } from '../lib/types';
import type { Theme } from '../lib/types';
import type { Lang } from '../lib/i18n';
import { t } from '../lib/i18n';

export default function BitacoraView({ theme, lang }: { theme: Theme; lang: Lang }) {
  const threads = loadJSON<ThreadSummary[]>(LS.threads, []);
  const [q, setQ] = React.useState('');

  const filtered = threads
    .filter((t) => t.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt));

  function fmt(ts: number) {
    return new Date(ts).toLocaleString();
  }

  return (
    <div
      className={`p-3 max-w-screen-sm mx-auto ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      <div className="text-lg font-semibold mb-2">
        {t(lang, 'bitacora', 'title')}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t(lang, 'bitacora', 'searchPlaceholder')}
        className={`w-full rounded-xl border px-3 py-2 mb-3 ${
          theme === 'dark'
            ? 'bg-slate-800 border-slate-700 text-slate-100'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      />

      <div className="space-y-2">
        {filtered.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl border p-3 ${
              theme === 'dark' ? 'border-slate-700' : 'border-slate-300'
            }`}
          >
            <div className="font-medium">{t.title || t.id}</div>
            <div className="text-xs opacity-60">
              {fmt(t.updatedAt ?? t.createdAt)}
            </div>
          </div>
        ))}

        {!filtered.length && (
          <div className="opacity-60 text-sm">
            {t(lang, 'bitacora', 'noResults')}
          </div>
        )}
      </div>
    </div>
  );
}
