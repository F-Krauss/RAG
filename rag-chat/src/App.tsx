// src/App.tsx
import React from 'react';
import AppShell from './components/AppShell';
import RAGChat from './components/chat/RAGChat';
import BitacoraView from './components/BitacoraView';
import LocatorView from './components/LocatorView';
import FAQView from './components/FAQsView';
import DocsView from './components/DocsView';
import SupportView from './components/SupportView';
// import Sidebar from './components/SideBar';
import Login from './components/Login';

import type { Theme, DataSource, NavView, ThreadSummary } from './lib/types';
import { LS, loadJSON } from './lib/storage';
import { getSavedLang, saveLang, t, type Lang } from './lib/i18n';

export default function App() {
  const [theme, setTheme] = React.useState<Theme>('light');
  const [lang, setLang] = React.useState<Lang>(getSavedLang());
  const [view, setView] = React.useState<NavView>('chat');
  const [open, setOpen] = React.useState(false);           // drawer móvil
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleChangeLang = (newLang: Lang) => {
    setLang(newLang);
    saveLang(newLang);
    document.title = newLang === 'es'
      ? 'T-Efficiency | Asistente Técnico'
      : 'T-Efficiency | Technical Assistant';
  };

  const handleToggleTheme = () =>
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const [source, setSource] = React.useState<DataSource>({
    kind: 'plant',
    id: 'north',
    name: 'Planta Norte',
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const recent = loadJSON<ThreadSummary[]>(LS.threads, [])
    .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
    .slice(0, 10);

  if (!isLoggedIn) {
    return (
      <Login
        theme={theme}
        lang={lang}
        logoUrl="/vite.svg"
        t={(k: string) => t(lang, 'login', k as any)}
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
      <AppShell
        theme={theme}
        lang={lang}
        onChangeLang={handleChangeLang}
        onToggleTheme={handleToggleTheme}
        onOpenMenu={() => setOpen(true)}         // abre drawer móvil
        onLogout={() => setIsLoggedIn(false)}
        source={source}
        onChangeSource={setSource}
        mobileMenuOpen={open}
        onCloseMobileMenu={() => setOpen(false)}
        onSelectView={setView}                   // 👈 ahora AppShell puede cambiar la vista
        recent={recent}
      >
        {view === 'chat'     && <RAGChat    theme={theme} lang={lang} />}
        {view === 'library'  && <DocsView   theme={theme} lang={lang} />}
        {view === 'support'  && <SupportView theme={theme} lang={lang} />}
        {view === 'bitacora' && <BitacoraView theme={theme} lang={lang} />}
        {view === 'locator'  && <LocatorView theme={theme} lang={lang} />}
        {view === 'faqs'     && <FAQView    theme={theme} lang={lang} />}
      </AppShell>

      {/* Drawer móvil (separado) */}
      {/* <Sidebar
        theme={theme}
        lang={lang}
        open={open}
        onClose={() => setOpen(false)}
        onSelectView={(v) => { setView(v); setOpen(false); }}  // cierra y cambia vista
        recent={recent}
      /> */}
    </div>
  );
}
