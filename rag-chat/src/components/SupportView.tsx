import React from 'react';
import type { Theme } from '../lib/types';
import type { Lang } from '../lib/i18n';
import { t } from '../lib/i18n';

export default function SupportView({ theme, lang }: { theme: Theme; lang: Lang }) {
  return (
    <div
      className={`p-6 space-y-3 ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      <h2 className="text-xl font-semibold">{t(lang, 'support', 'title')}</h2>

      <p className="opacity-80">
        {t(lang, 'support', 'contactText')}{' '}
        <a
          className="underline text-blue-600 dark:text-blue-400"
          href="mailto:soporte@t-efficiency.com"
        >
          soporte@t-efficiency.com
        </a>
        .
      </p>

      <p className="opacity-80">{t(lang, 'support', 'altContact')}</p>
    </div>
  );
}
