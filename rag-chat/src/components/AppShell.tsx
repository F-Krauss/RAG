import { useState, useEffect, useRef } from 'react';
import type { Lang } from '../lib/i18n';
import { t } from '../lib/i18n';
import type { Theme, DataSource } from '../lib/types';
import UserMenu from './UserMenu';

type Props = {
  logoUrl?: string;
  theme: Theme;
  lang: Lang;
  source: DataSource;
  onToggleTheme: () => void;
  onChangeLang: (l: Lang) => void;
  onChangeSource: (s: DataSource) => void;
  onOpenMenu: () => void;
  onLogout: () => void;
  children?: React.ReactNode;
};

export default function AppShell({
  logoUrl,
  theme,
  lang,
  source,
  onToggleTheme,
  onChangeLang,
  onChangeSource,
  onOpenMenu,
  onLogout,
  children,
}: Props) {
  const [picker, setPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);



  // 🔹 Etiqueta del origen actual traducible
  const sourceLabel =
    source.kind === 'plant'
      ? source.name
      : source.kind === 'machine'
        ? `${t(lang, "appShell", 'machine_label')} #${source.id}`
        : t(lang, "appShell", 'internal_policies');

  // 🔹 Cierra el menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sourceOptions: { id: string; name: string; kind: 'plant' | 'machine' | 'policy' }[] = [
    { id: 'north', name: t(lang, 'appShell', 'plant_north'), kind: 'plant' },
    { id: 'south', name: t(lang, 'appShell', 'plant_south'), kind: 'plant' },
    { id: 'A01', name: `${t(lang, 'appShell', 'machine_label')} A01`, kind: 'machine' },
  ];


  return (
    <div
      className={`min-h-screen flex flex-col ${theme === 'dark'
        ? 'bg-slate-900 text-slate-100'
        : 'bg-white text-slate-900'
        }`}
    >
      {/* 🔹 Encabezado superior */}
      <header
        className={`h-14 flex items-center justify-between px-3 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}
      >
        {/* Menú lateral + selector de base */}
        <div className="flex items-center gap-2">
          <button
            aria-label={t(lang, "appShell", 'open_menu')}
            onClick={onOpenMenu}
            className="sm:hidden px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ☰
          </button>

          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setPicker(!picker)}
              className="px-2 py-1 rounded-xl border text-sm whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {sourceLabel}
            </button>

            {/* 🔹 Menú de selección */}
            {picker && (
              <div
                className={`absolute top-12 left-0 w-52 rounded-xl shadow-lg border z-50 ${theme === 'dark'
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <div className="text-xs uppercase px-3 pt-2 opacity-60">
                  {t(lang, "appShell", 'select_base')}
                </div>
                {sourceOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onChangeSource({
                        kind: opt.kind,
                        id: opt.id,
                        name: opt.name,
                      });
                      setPicker(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🔹 Usuario + idioma + tema */}
        <div className="flex items-center gap-1 sm:gap-2">
          <UserMenu onLogout={onLogout} />
          <select
            className="text-sm rounded border px-2 py-1 bg-transparent"
            value={lang}
            onChange={(e) => onChangeLang(e.target.value as Lang)}
            aria-label="language"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
          <button
            className="text-sm px-2 py-1 rounded border"
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          {logoUrl && (
            <img
              src={logoUrl}
              className="h-6 sm:h-7 hidden sm:block"
              alt="logo"
            />
          )}
        </div>
      </header>

      {/* 🔹 Contenido principal */}
      <main
        className={`flex-1 transition-all duration-300 p-4 ${collapsed ? 'sm:ml-16' : 'sm:ml-64'
          }`}
      >
        {children}
      </main>


    </div>
  );
}
