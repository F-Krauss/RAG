// import React from 'react';
import type { Theme } from '../lib/types';
import type { Lang } from '../lib/i18n';

export default function Login({
  theme,
//   lang,
  t,
  logoUrl,
  onLogin,
}: {
  theme: Theme;
  lang: Lang;
  t: (k: string) => string;
  logoUrl: string;
  onLogin: () => void;
}) {
    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'} grid place-items-center p-6`}>
            <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} w-full max-w-sm border p-6 rounded-2xl shadow`}>
                <div className="text-center mb-4 space-y-2">
                    <img src={logoUrl} alt="logo" className="h-10 mx-auto" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    <div className="text-2xl font-bold">T‑Efficiency</div>
                    <div className="text-sm opacity-70">{t('loginTitle')}</div>
                </div>
                <label className="text-xs opacity-80">{t('user')}</label>
                <input className={`w-full mt-1 mb-3 px-3 py-2 rounded ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} border outline-none`} placeholder="email@empresa.com" />
                <label className="text-xs opacity-80">{t('pass')}</label>
                <input type="password" className={`w-full mt-1 mb-4 px-3 py-2 rounded ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} border outline-none`} placeholder="••••••••" />
                <button onClick={onLogin} className="w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white">{t('enter')}</button>
            </div>
        </div>
    );
}