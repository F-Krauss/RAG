import React from 'react';
import AppShell from './components/AppShell';
import RAGChat from './components/chat/RAGChat';
import BitacoraView from './components/BitacoraView';
import LocatorView from './components/LocatorView';
import FAQView from './components/FAQsView';
import DocsView from './components/DocsView';
import SupportView from './components/SupportView';
import Sidebar from './components/SideBar';
import Login from './components/Login';
import type { Theme, DataSource, NavView, ThreadSummary } from './lib/types';
import { LS, loadJSON } from './lib/storage';
import { getSavedLang, saveLang, t, type Lang } from './lib/i18n';

export default function App() {
  const [theme, setTheme] = React.useState<Theme>('light');
  const [lang, setLang] = React.useState<Lang>(getSavedLang());
  const [view, setView] = React.useState<NavView>('chat');
  const [open, setOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  function handleChangeLang(newLang: Lang) {
    setLang(newLang);
    saveLang(newLang);
    document.title =
      newLang === 'es'
        ? 'T-Efficiency | Asistente Técnico'
        : 'T-Efficiency | Technical Assistant';
  }

  function handleToggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }

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
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      <AppShell
        theme={theme}
        lang={lang}
        onChangeLang={handleChangeLang}
        onToggleTheme={handleToggleTheme}
        onOpenMenu={() => setOpen(true)}
        onLogout={() => setIsLoggedIn(false)}
        source={source}
        onChangeSource={setSource}
        recent={recent}
      >
        {view === 'chat' && <RAGChat theme={theme} lang={lang} />}
        {view === 'library' && <DocsView theme={theme} lang={lang} />}
        {view === 'support' && <SupportView theme={theme} lang={lang} />}
        {view === 'bitacora' && <BitacoraView theme={theme} lang={lang} />}
        {view === 'locator' && <LocatorView theme={theme} lang={lang} />}
        {view === 'faqs' && <FAQView theme={theme} lang={lang} />}
      </AppShell>

      <Sidebar
        theme={theme}
        lang={lang}
        open={open}
        onClose={() => setOpen(false)}
        onSelectView={setView}
      />

    </div>
  );
}
