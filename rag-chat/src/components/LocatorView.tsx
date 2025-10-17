import React from 'react';
import type { Theme } from '../lib/types';
import type { Lang } from '../lib/i18n';
import { t } from '../lib/i18n';


type Machine = { id: string; name: string; line: string; x: number; y: number };
type Plant = {
  id: 'north' | 'south';
  name: string;
  lines: string[];
  width: number; 
  height: number;
  machines: Machine[];
};

const PLANTS: Plant[] = [
  {
    id: 'north',
    name: 'Planta Norte',
    width: 1000,
    height: 600,
    lines: ['L1', 'L2', 'L3'],
    machines: [
      { id: 'N-L1-A01', name: 'A01 Empacadora', line: 'L1', x: 140, y: 120 },
      { id: 'N-L1-A02', name: 'A02 Selladora', line: 'L1', x: 260, y: 130 },
      { id: 'N-L2-B01', name: 'B01 Mezcladora', line: 'L2', x: 520, y: 250 },
      { id: 'N-L2-B02', name: 'B02 Dosificadora', line: 'L2', x: 660, y: 240 },
      { id: 'N-L3-C01', name: 'C01 Envasadora', line: 'L3', x: 820, y: 460 },
      { id: 'N-L3-C02', name: 'C02 Paletizadora', line: 'L3', x: 720, y: 520 },
    ],
  },
  {
    id: 'south',
    name: 'Planta Sur',
    width: 1000,
    height: 600,
    lines: ['L10', 'L20'],
    machines: [
      { id: 'S-L10-A10', name: 'A10 Lavadora', line: 'L10', x: 180, y: 180 },
      { id: 'S-L10-A11', name: 'A11 Pasteur', line: 'L10', x: 300, y: 220 },
      { id: 'S-L20-B20', name: 'B20 Horno', line: 'L20', x: 650, y: 300 },
      { id: 'S-L20-B21', name: 'B21 Cooler', line: 'L20', x: 780, y: 360 },
    ],
  },
];

function groupByLine(machines: Machine[]) {
  return machines.reduce<Record<string, Machine[]>>((acc, m) => {
    (acc[m.line] ||= []).push(m);
    return acc;
  }, {});
}

function useSearch(query: string, items: Machine[]) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.line.toLowerCase().includes(q)
  );
}

export default function LocatorView({
  theme,
  lang,
}: {
  theme: Theme;
  lang: Lang;
}) {
  const [activePlantId, setActivePlantId] = React.useState<Plant['id']>('north');
  const activePlant = React.useMemo(
    () => PLANTS.find((p) => p.id === activePlantId)!,
    [activePlantId]
  );

  const [query, setQuery] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const filtered = useSearch(query, activePlant.machines);
  const grouped = React.useMemo(() => groupByLine(filtered), [filtered]);

  const selected = activePlant.machines.find((m) => m.id === selectedId) || null;

  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3">
        <h1 className="text-xl font-semibold">{t(lang, 'locator', 'title')}</h1>
        <div className="flex gap-1">
          {PLANTS.map((p) => {
            const active = p.id === activePlantId;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePlantId(p.id);
                  setSelectedId(null);
                  setQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl border text-sm transition ${
                  active
                    ? isDark
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-100 border-slate-300'
                    : isDark
                      ? 'border-slate-800 hover:bg-slate-800'
                      : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        <div className="lg:col-span-8">
          <div
            className={`rounded-2xl border ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            } overflow-hidden`}
          >
            <div
              className={`px-3 py-2 text-sm border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              {activePlant.name}
            </div>

            <div className="p-3">
              <div className="w-full">
                <svg
                  viewBox={`0 0 ${activePlant.width} ${activePlant.height}`}
                  className="w-full h-[280px] sm:h-[360px] lg:h-[460px] bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-xl"
                  onClick={(e) => {
                    if ((e.target as Element).tagName === 'svg') setSelectedId(null);
                  }}
                >
                  {activePlant.lines.map((line, idx) => {
                    const blockW = activePlant.width / activePlant.lines.length;
                    const x = idx * blockW;
                    const hue = 210 + idx * 18;
                    return (
                      <g key={line}>
                        <rect
                          x={x + 8}
                          y={8}
                          width={blockW - 16}
                          height={activePlant.height - 16}
                          rx={18}
                          fill={`hsl(${hue} 40% ${isDark ? '16%' : '97%'})`}
                          stroke={isDark ? '#0f172a' : '#e2e8f0'}
                        />
                        <text
                          x={x + blockW / 2}
                          y={36}
                          textAnchor="middle"
                          fontSize="20"
                          fill={isDark ? '#cbd5e1' : '#334155'}
                        >
                          {line}
                        </text>
                      </g>
                    );
                  })}

                  {activePlant.machines.map((m) => {
                    const sel = m.id === selectedId;
                    return (
                      <g
                        key={m.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(m.id);
                        }}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={m.x}
                          cy={m.y}
                          r={sel ? 14 : 10}
                          fill={sel ? '#2563eb' : '#0ea5e9'}
                          opacity={sel ? 1 : 0.9}
                          stroke={isDark ? '#0b1220' : '#ffffff'}
                          strokeWidth={sel ? 3 : 2}
                        />
                        <text
                          x={m.x + 16}
                          y={m.y + 5}
                          fontSize="18"
                          fill={isDark ? '#cbd5e1' : '#0f172a'}
                        >
                          {m.name}
                        </text>
                      </g>
                    );
                  })}

                  {selected && (
                    <circle
                      cx={selected.x}
                      cy={selected.y}
                      r={28}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth={3}
                      strokeDasharray="6 8"
                    />
                  )}
                </svg>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-sky-500" />
                  <span>Máquina</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-600" />
                  <span>Seleccionada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div
            className={`rounded-2xl border ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            } overflow-hidden`}
          >
            <div
              className={`p-3 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(lang, 'locator', 'search')}
                className={`w-full px-3 py-2 rounded-xl border text-sm ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                } focus:outline-none`}
              />
            </div>

            <div className="max-h-[460px] overflow-y-auto p-2">
              {Object.keys(grouped).length === 0 && (
                <div className="px-3 py-8 text-center opacity-70">
                  {t(lang, 'locator', 'noResults')}
                </div>
              )}

              {Object.entries(grouped).map(([line, list]) => (
                <div key={line} className="mb-3">
                  <div className="px-3 py-1 text-xs font-semibold uppercase opacity-70">
                    {activePlant.name} · {line}
                  </div>
                  <ul className="mt-1">
                    {list.map((m) => {
                      const sel = m.id === selectedId;
                      return (
                        <li key={m.id}>
                          <button
                            onClick={() => setSelectedId(m.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg border mb-1 transition ${
                              sel
                                ? isDark
                                  ? 'bg-slate-800 border-slate-700'
                                  : 'bg-slate-100 border-slate-300'
                                : isDark
                                  ? 'border-slate-800 hover:bg-slate-800/60'
                                  : 'border-slate-200 hover:bg-slate-50'
                            }`}
                            title={m.id}
                          >
                            <div className="text-sm font-medium">{m.name}</div>
                            <div className="text-xs opacity-70">
                              {m.id} · {m.line}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
