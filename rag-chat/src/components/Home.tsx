import React from 'react';
import type { Theme } from '../lib/types';
export default function Home({ theme, t, logoUrl, plantas, onSelectPlant, onOpenDocs }: { theme: Theme; t: (k: string) => string; logoUrl: string; plantas: string[]; onSelectPlant: (p: string) => void; onOpenDocs: () => void }) {
    return (
        <div className="p-6">
            <div className="mb-6 flex items-center gap-3">
                <img src={logoUrl} alt="logo" className="h-8" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                <div className="text-2xl font-bold">T‑Efficiency</div>
                <span className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} px-2 py-0.5 text-xs rounded border`}>{t('demo')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {plantas.map(p => (
                    <button key={p} onClick={() => onSelectPlant(p)} className={`${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-100 border-slate-300'} h-28 rounded-2xl border flex items-center justify-center text-center p-3`}>
                        <div>
                            <div className="text-3xl mb-2">🏭</div>
                            <div className="text-sm font-semibold">{p}</div>
                        </div>
                    </button>
                ))}
                <button onClick={onOpenDocs} className={`${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-100 border-slate-300'} h-28 rounded-2xl border flex items-center justify-center text-center p-3`}>
                    <div>
                        <div className="text-3xl mb-2">📘</div>
                        <div className="text-sm font-semibold">{t('manuales')}</div>
                    </div>
                </button>
            </div>
        </div>
    );
}