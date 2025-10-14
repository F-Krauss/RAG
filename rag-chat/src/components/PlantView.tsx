import React from 'react';
import type { Theme } from '../lib/types';
import type { Lang } from '../lib/i18n';


export default function PlantView({ theme, t, plant, lines, onBack, onSelectLine }: { theme: Theme; t: (k: string) => string; plant: string | null; lines: string[]; onBack: () => void; onSelectLine: (l: string) => void }) {
    return (
        <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
                <button className={`${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} text-sm px-2 py-1 rounded`} onClick={onBack}>{t('volver')}</button>
                <div className="text-xl font-semibold">{plant}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {lines.map(l => (
                    <button key={l} onClick={() => onSelectLine(l)} className={`${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-100 border-slate-300'} h-24 rounded-2xl border flex items-center justify-center p-3`}>
                        <div className="text-center"><div className="text-2xl mb-1">🛠️</div><div className="text-sm font-semibold">{l}</div></div>
                    </button>
                ))}
            </div>
        </div>
    );
}