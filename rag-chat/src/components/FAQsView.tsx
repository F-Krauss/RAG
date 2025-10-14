import React from 'react';
import type { Theme } from '../lib/types';
import type { Lang } from '../lib/i18n';
import { t } from '../lib/i18n';

export default function FAQsView({ theme, lang }: { theme: Theme; lang: Lang }) {
  const faqs = [
    {
      q: t(lang, 'faqs', 'q_upload'),
      a: t(lang, 'faqs', 'a_upload'),
    },
    {
      q: t(lang, 'faqs', 'q_links'),
      a: t(lang, 'faqs', 'a_links'),
    },
    {
      q: t(lang, 'faqs', 'q_darkmode'),
      a: t(lang, 'faqs', 'a_darkmode'),
    },
  ];

  return (
    <div
      className={`p-6 space-y-4 ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      <h2 className="text-xl font-semibold">{t(lang, 'faqs', 'title')}</h2>
      <ul className="space-y-3">
        {faqs.map((f, i) => (
          <li
            key={i}
            className={`p-3 rounded border ${
              theme === 'dark' ? 'border-slate-700' : 'border-slate-300'
            }`}
          >
            <div className="font-medium">{f.q}</div>
            <div className="opacity-80 text-sm">{f.a}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
