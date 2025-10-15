import React, { useEffect, useRef, useState } from 'react';
import type { Lang } from '../lib/i18n';
import { t } from '../lib/i18n';
import type { Theme, DataSource, NavView, ThreadSummary } from '../lib/types';

import UserMenu from './UserMenu';
import Sidebar from './SideBar';

const SIDEBAR_W_OPEN = 256;
const SIDEBAR_W_COLLAPSED = 64;

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
  onSelectView: (v: NavView) => void;
  recent?: ThreadSummary[];
  children?: React.ReactNode;

  mobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
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
  onSelectView,
  recent = [],
  children,

  mobileMenuOpen,
  onCloseMobileMenu,
}: Props) {
  const [picker, setPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  const sourceLabel =
    source.kind === 'plant'
      ? source.name
      : source.kind === 'machine'
      ? `${t(lang, 'appShell', 'machine_label')} #${source.id}`
      : t(lang, 'appShell', 'internal_policies');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [isDesktop, setIsDesktop] = React.useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 640px)').matches
      : false
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 640px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    try {
      mq.addEventListener('change', handler);
    } catch {
      // Safari <14
      // @ts-ignore
      mq.addListener(handler);
    }
    return () => {
      try {
        mq.removeEventListener('change', handler);
      } catch {
        // Safari <14
        // @ts-ignore
        mq.removeListener(handler);
      }
    };
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col overflow-x-hidden ${
        theme === 'dark'
          ? 'bg-slate-900 text-slate-100'
          : 'bg-white text-slate-900'
      }`}
    >
      <header
        className={`h-14 flex items-center justify-between px-3 border-b ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Drawer móvil */}
          <button
            aria-label={t(lang, 'appShell', 'open_menu')}
            onClick={onOpenMenu}
            className="sm:hidden px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ☰
          </button>

          {/* Selector de base */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setPicker((s) => !s)}
              className="px-2 py-1 rounded-xl border text-sm whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {sourceLabel}
            </button>

            {picker && (
              <div
                className={`absolute top-12 left-0 w-52 rounded-xl shadow-lg border z-50 ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-xs uppercase px-3 pt-2 opacity-60">
                  {t(lang, 'appShell', 'select_base')}
                </div>
                {[
                  {
                    id: 'north',
                    name: t(lang, 'appShell', 'plant_north'),
                    kind: 'plant' as const,
                  },
                  {
                    id: 'south',
                    name: t(lang, 'appShell', 'plant_south'),
                    kind: 'plant' as const,
                  },
                  {
                    id: 'A01',
                    name: `${t(lang, 'appShell', 'machine_label')} A01`,
                    kind: 'machine' as const,
                  },
                ].map((opt) => (
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

        {/* Usuario + idioma + tema */}
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

      {/* Layout principal */}
      <div
        className="relative flex-1 grid transition-[grid-template-columns] duration-300"
        style={{
          gridTemplateColumns: isDesktop
            ? `minmax(0, ${collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_OPEN}px) 1fr`
            : '1fr',
        }}
      >
        {/* Botón colapsar */}
        <button
          onClick={() => setCollapsed((s) => !s)}
          className="hidden sm:flex items-center justify-center absolute top-2 z-40 -translate-x-1/2 rounded-full border shadow bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 w-6 h-6"
          style={{
            left: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_OPEN,
          }}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? '›' : '‹'}
        </button>

        {/* Sidebar desktop */}
        <div
          className={`hidden sm:block border-r ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <Sidebar
            theme={theme}
            lang={lang}
            open={false}
            onClose={() => {}}
            collapsed={collapsed}
            onSelectView={onSelectView}
            recent={recent}
          />
        </div>

        {/* Contenido */}
        <main className="relative min-w-0">
          <div className="h-full w-full p-3 sm:p-4">{children}</div>
        </main>
      </div>

      {/* 📱 Sidebar móvil */}
      <Sidebar
        theme={theme}
        lang={lang}
        open={mobileMenuOpen}
        onClose={onCloseMobileMenu || (() => {})}
        onSelectView={(v) => {
          onSelectView(v);
          onCloseMobileMenu?.();
        }}
        recent={recent}
      />
    </div>
  );
}
