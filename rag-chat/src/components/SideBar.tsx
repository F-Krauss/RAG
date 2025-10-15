// src/SideBar.tsx
import type { Theme, NavView, ThreadSummary } from '../lib/types';
import type { Lang } from '../lib/i18n';
import { t } from '../lib/i18n';
import {
  MessageSquare, Book, Map, LifeBuoy, HelpCircle, ClipboardList, X,
} from 'lucide-react';

type Props = {
  theme: Theme;
  lang: Lang;
  onClose: () => void;
  onSelectView: (view: NavView) => void;
  recent?: ThreadSummary[];
  open?: boolean;        
  collapsed?: boolean;  
};

export default function Sidebar({
  theme,
  lang,
  onClose,
  onSelectView,
  recent = [],
  open = false,
  collapsed = false,
}: Props) {
  const textColor   = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const bgColor     = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';

  const links = [
    { id: 'chat',     label: t(lang, 'menu', 'chat'),     icon: <MessageSquare size={18} /> },
    { id: 'library',  label: t(lang, 'menu', 'library'),  icon: <Book size={18} /> },
    { id: 'locator',  label: t(lang, 'menu', 'locator'),  icon: <Map size={18} /> },
    { id: 'support',  label: t(lang, 'menu', 'support'),  icon: <LifeBuoy size={18} /> },
    { id: 'faqs',     label: t(lang, 'menu', 'faqs'),     icon: <HelpCircle size={18} /> },
    { id: 'bitacora', label: t(lang, 'menu', 'bitacora'), icon: <ClipboardList size={18} /> },
  ];

  return (
    <>
      <aside
        className={`hidden sm:flex flex-col h-[calc(100vh-60px)] overflow-y-auto transition-all duration-300
        ${bgColor} w-full p-3`}  
      >
        {!collapsed && (
          <div className="mb-6 sticky top-0 bg-inherit z-10">
            <h2 className={`text-lg font-semibold ${textColor}`}>{t(lang, 'menu', 'title')}</h2>
          </div>
        )}

        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => onSelectView(link.id as NavView)}
              className={`flex items-center gap-3 w-full text-left rounded px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${textColor}`}
              title={collapsed ? link.label : undefined}
            >
              {link.icon}
              {!collapsed && <span>{link.label}</span>}
            </button>
          ))}
        </nav>

        {!collapsed && recent.length > 0 && (
          <div className="mt-6">
            <h3 className={`text-sm font-semibold opacity-70 mb-2 ${textColor}`}>
              {t(lang, 'menu', 'recent')}
            </h3>
            <ul className="text-sm space-y-1">
              {recent.map((r) => (
                <li key={r.id} className="truncate opacity-80">
                  {r.title || `${t(lang, 'summary', 'autoTitlePrefix')} ${r.id}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div
        className={`fixed inset-0 z-50 sm:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } bg-black/40 backdrop-blur-sm`}
        onClick={onClose}
      >
        <aside
          className={`absolute left-0 top-0 h-full w-64 ${bgColor} p-4 border-r ${borderColor} shadow-lg transform transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${textColor}`}>{t(lang, 'menu', 'title')}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => { onSelectView(link.id as NavView); onClose(); }}
                className="flex items-center gap-3 text-left rounded px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
