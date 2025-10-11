import type { Lang, Theme } from './types';
import { LS } from './storage';

export const dict: Record<Lang, Record<string,string>> = {
  es: {
    principal: 'Principal',
    docs: 'Documentación',
    history: 'Histórico',
    support: 'Soporte',
    faqs: 'FAQs',
    newChat: 'Nueva conversación',
    uploadPdf: 'Subir PDFs',
    addLink: 'Añadir enlace',
    linkPlaceholder: 'https://…',
    lastChats: 'Últimos chats',
    profile: 'Perfil',
    logout: 'Cerrar sesión',
    loginTitle: 'Iniciar sesión',
    user: 'Usuario',
    pass: 'Contraseña',
    enter: 'Entrar',
  },
  en: {
    principal: 'Home',
    docs: 'Documentation',
    history: 'History',
    support: 'Support',
    faqs: 'FAQs',
    newChat: 'New conversation',
    uploadPdf: 'Upload PDFs',
    addLink: 'Add link',
    linkPlaceholder: 'https://…',
    lastChats: 'Recent chats',
    profile: 'Profile',
    logout: 'Sign out',
    loginTitle: 'Sign in',
    user: 'User',
    pass: 'Password',
    enter: 'Enter',
  }
};

export const getLang = (): Lang => (localStorage.getItem(LS.lang) as Lang) || 'es';
export const setLang = (l: Lang) => localStorage.setItem(LS.lang, l);

export function initTheme(): Theme {
  const t = (localStorage.getItem(LS.theme) as Theme) || 'light';
  document.documentElement.classList.toggle('dark', t === 'dark');
  return t;
}
export function setThemeClass(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark');
  localStorage.setItem(LS.theme, t);
}
