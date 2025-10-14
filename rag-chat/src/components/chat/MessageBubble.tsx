import React from 'react';
import type { Citation, Message, Theme } from '../../lib/types';

export const Citations = ({ list }: { list?: Citation[] }) =>
  !list?.length ? null : (
    <div className="mt-2 text-sm opacity-80 space-x-2">
      {list.map((c) => (
        <a
          key={`${c.n}_${c.url}`}
          className="underline text-blue-600 dark:text-blue-300 hover:opacity-80"
          href={c.url}
          target="_blank"
          rel="noreferrer"
        >
          [{c.n}] {c.title || c.url}
        </a>
      ))}
    </div>
  );

export const Bubble = ({
  role,
  children,
  theme,
}: {
  role: Message['role'];
  children: React.ReactNode;
  theme: Theme;
}) => (
  <div className={`w-full flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`${
        role === 'user'
          ? 'bg-blue-600 text-white'
          : theme === 'dark'
          ? 'bg-slate-800 text-slate-100'
          : 'bg-white text-slate-900 border border-slate-200'
      } px-4 py-3 rounded-2xl max-w-[75%] whitespace-pre-wrap leading-relaxed shadow`}
    >
      {children}
    </div>
  </div>
);

function Attachments({ list }: { list?: NonNullable<Message['attachments']> }) {
  if (!list?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {list.map((a) => (
        <a
          key={a.id}
          href={a.dataUrl}
          download={a.name}
          target="_blank"
          rel="noreferrer"
          className="group border rounded-xl p-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
          title={a.name}
        >
          {a.mime?.startsWith('image/') ? (
            <img src={a.dataUrl} alt={a.name} className="w-12 h-12 rounded object-cover border" />
          ) : (
            <div className="w-12 h-12 rounded border grid place-items-center text-xs">FILE</div>
          )}
          <span className="max-w-[200px] truncate underline opacity-90 group-hover:opacity-100">
            {a.name}
          </span>
        </a>
      ))}
    </div>
  );
}

export default function MessageBubble({ message, theme }: { message: Message; theme: Theme }) {
  return (
    <div>
      <Bubble role={message.role} theme={theme}>
        {message.content}
        <Attachments list={message.attachments} />
      </Bubble>
      <Citations list={message.citations} />
    </div>
  );
}
