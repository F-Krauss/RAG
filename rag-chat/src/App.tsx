// src/App.tsx
import React from 'react';
import './index.css';
import AppShell from './components/AppShell';
import Home from './components/Home';
import DocsView from './components/DocsView';
import SupportView from './components/SupportView';
import FAQsView from './components/FAQsView';
import RAGChat from './components/chat/RAGChat';

import type { Lang, Theme, View, NavView } from './lib/types';

export default function App() {
  const [theme, setTheme] = React.useState<Theme>('light');
  const [lang, setLang] = React.useState<Lang>('es');
  const [view, setView] = React.useState<View>('home');
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const t = (k: string) => k;
  const plantas = ['Planta Este', 'Planta Oeste', 'Planta Norte', 'Planta Sur'];



  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <AppShell
      logoUrl="/vite.svg"
      theme={theme}
      lang={lang}
      onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      onChangeLang={setLang}
      onNav={(v: NavView) => setView(v)}
      onSelectThread={(id: string) => {
        setActiveThreadId(id);
        setView('chat');
      }}
    >
      {view === 'home' && <Home
          theme={theme}
          t={t}
          logoUrl="/vite.svg"
          plantas={plantas}
          onSelectPlant={(p: string) => {
            // aquí podrías guardar la planta seleccionada y abrir el chat
            setView('chat');
          }}
          onOpenDocs={() => setView('docs')}
        />}
      {view === 'docs' && <DocsView />}
      {view === 'support' && <SupportView />}
      {view === 'faqs' && <FAQsView />}
      {view === 'history' && (
        <div className="p-6 text-sm opacity-70">Aquí va el histórico…</div>
      )}
      {view === 'chat' && (
        <RAGChat
          context={{ plant: undefined, line: undefined }}
          forceThreadId={activeThreadId ?? undefined}
          theme={theme}
          t={(k) => k}
        />
      )}
    </AppShell>
  );
}
