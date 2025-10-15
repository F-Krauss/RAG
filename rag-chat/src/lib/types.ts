// src/lib/types.ts
export type Theme = 'light' | 'dark';
export type Lang = 'es' | 'en';

export type NavView = 'chat' | 'bitacora' | 'locator' | 'faqs' | 'library' | 'support';

export type Citation = { n: number; title?: string; url: string };


export type Attachment = {
  id: string;
  name: string;       
  mime: string;       
  size?: number;      
  dataUrl: string;    
  createdAt?: number; 
};

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  attachments?: Attachment[];  
};

export type DataSource = {
  kind: 'plant' | 'machine' | 'policy';
  id: string;
  name: string;
};

export type ThreadSummary = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  source?: DataSource;
};

export type DocItem = {
  id: string;
  name: string;
  mime: string;
  size?: number;
  link?: string;
  text?: string;
  createdAt?: number;
  updatedAt?: number;
  isReference?: boolean;
};

export interface AppShellProps {
  theme: Theme;
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  onToggleTheme: () => void;
  onOpenMenu: () => void;
  onLogout: () => void;
  source: DataSource;
}
