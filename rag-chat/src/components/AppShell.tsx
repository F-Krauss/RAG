// src/components/AppShell.tsx
import React from 'react';
import type { Lang, Theme, NavView, ThreadSummary } from '../lib/types';
import { getRecentThreads } from '../lib/storage';

type Props = {
  logoUrl?: string;
  theme: Theme;
  lang: Lang;
  onToggleTheme: () => void;
  onChangeLang: (l: Lang) => void;
  onNav: (view: NavView) => void;
  onSelectThread: (id: string) => void;
  children?: React.ReactNode;
};

export default function AppShell({
  logoUrl, theme, lang, onToggleTheme, onChangeLang, onNav, onSelectThread, children,
}: Props) {
  const [open, setOpen] = React.useState(true);
  const [recent, setRecent] = React.useState<ThreadSummary[]>([]);

  React.useEffect(() => setRecent(getRecentThreads(10)), []);

  return (
    <div className={`h-screen w-full font-sans ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'} flex`}>
      {/* Sidebar */}
      <aside className={`${open ? 'w-72' : 'w-14'} transition-all border-r ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} flex flex-col`}>
        <div className="flex items-center gap-2 p-3">
          <button className="text-xl" onClick={() => setOpen(!open)}>☰</button>
          {open && <div className="text-sm opacity-70">Menú</div>}
        </div>

        <nav className="px-2 space-y-1">
          <Item open={open} label="Principal" icon="🏠" onClick={() => onNav('home')} />
          <Item open={open} label="Documentación" icon="📚" onClick={() => onNav('docs')} />
          <Item open={open} label="Histórico" icon="🕘" onClick={() => onNav('history')} />
          <div className={`mt-4 text-xs px-3 ${open ? 'block' : 'hidden'} opacity-60`}>Últimos chats</div>
          <div className={`${open ? 'block' : 'hidden'} space-y-1 max-h-64 overflow-auto pr-2`}>
            {recent.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectThread(t.id)}
                className="w-full text-left text-sm truncate px-3 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.title || t.id}
              </button>
            ))}
          </div>
          <Item open={open} label="Soporte" icon="🆘" onClick={() => onNav('support')} />
          <Item open={open} label="FAQs" icon="❓" onClick={() => onNav('faqs')} />
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`h-14 flex items-center justify-between px-4 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            {logoUrl ? <img src={logoUrl} alt="logo" className="h-7" /> : <div className="font-semibold">T-Efficiency</div>}
          </div>
          <div className="flex items-center gap-2">
            <select
              className="text-sm rounded border px-2 py-1 bg-transparent"
              value={lang}
              onChange={(e) => onChangeLang(e.target.value as Lang)}
              aria-label="language"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <button className="text-sm px-2 py-1 rounded border" onClick={onToggleTheme}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <ProfileMenu />
          </div>
        </header>

        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}

function Item({ open, label, icon, onClick }: { open: boolean; label: string; icon: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
      <span>{icon}</span>
      <span className={`${open ? 'block' : 'hidden'} text-sm`}>{label}</span>
    </button>
  );
}

function ProfileMenu() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 grid place-items-center">👤</button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 shadow">
          <button className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700">Perfil</button>
          <button className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700">Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}
