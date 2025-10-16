import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Citation, Message, Theme, Attachment } from '../../lib/types';
import { LS, loadJSON, saveJSON, uuid } from '../../lib/storage';
import MessageBubble from './MessageBubble';
import ChatSummaryModal from './ChatSummaryModal';
import type { Lang } from '../../lib/i18n';
import { t } from '../../lib/i18n';
import { postToN8N } from '../../lib/api';
import CameraModal from './CameraModal';
import QrScannerModal from './QrScannerModal';

export default function RAGChat({
  theme,
  lang,
}: {
  context?: { plant?: string; line?: string };
  forceThreadId?: string;
  theme: Theme;
  lang: Lang;
}) {
  // --- Estado base
  const initialThreads = loadJSON(LS.threads, [] as any[]);
  const [threads, setThreads] = useState(() => {
    if (initialThreads.length) return initialThreads;
    const t0 = { id: uuid(), title: t(lang, 'chat', 'title'), createdAt: Date.now(), updatedAt: Date.now() };
    saveJSON(LS.threads, [t0]);
    return [t0];
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0].id);
  const [messages, setMessages] = useState<Message[]>(() => loadJSON<Message[]>(LS.messages(activeThreadId), []));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  function newChat() {
    const newT = { id: uuid(), title: t(lang, 'chat', 'title'), createdAt: Date.now(), updatedAt: Date.now() };
    setThreads(prev => [newT, ...prev]);
    saveJSON(LS.threads, [newT, ...threads]);
    setActiveThreadId(newT.id);
    setMessages([]);
    saveJSON(LS.messages(newT.id), []);
  }

  // --- Adjuntos / QR
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [pendingQR, setPendingQR] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // --- Menú ＋
  const [showTools, setShowTools] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => saveJSON(LS.threads, threads), [threads]);
  useEffect(() => saveJSON(LS.messages(activeThreadId), messages), [activeThreadId, messages]);
  useEffect(() => setMessages(loadJSON<Message[]>(LS.messages(activeThreadId), [])), [activeThreadId]);

  // --- Posiciona el menú flotante
  useEffect(() => {
    if (!showTools || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const margin = 8;
    const approxWidth = 224;
    let left = r.left + window.scrollX;
    left = Math.min(Math.max(left, margin + window.scrollX), vw - approxWidth - margin + window.scrollX);
    const top = r.top + window.scrollY - 100 - margin;
    setMenuPos({ top, left });
  }, [showTools]);

  // --- Reposiciona al hacer scroll o resize
  useEffect(() => {
    if (!showTools) return;
    const handler = () => {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const margin = 8;
      const approxWidth = 224;
      let left = r.left + window.scrollX;
      left = Math.min(Math.max(left, margin + window.scrollX), vw - approxWidth - margin + window.scrollX);
      const top = r.bottom + window.scrollY + margin;
      setMenuPos({ top, left });
    };
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, [showTools]);

  // --- Envío al servidor (con manejo robusto de error)
  async function sendMessage() {
    const text = input.trim();
    if ((!text && pendingAttachments.length === 0 && pendingQR.length === 0) || busy) return;

    setInput('');
    setBusy(true);

    const qrBlock = pendingQR.length ? `\n\nQR:\n${pendingQR.map(q => `• ${q}`).join('\n')}` : '';
    const userMsg: Message = {
      id: uuid(),
      role: 'user',
      content: `${text || ''}${qrBlock}`,
      attachments: pendingAttachments.length ? pendingAttachments : undefined,
    };

    const loading: Message = { id: uuid(), role: 'assistant', content: t(lang, 'chat', 'thinking') };
    setMessages(p => [...p, userMsg, loading]);

    try {
      const payload = {
        threadId: activeThreadId,
        message: text,
        qr: pendingQR,
        attachments: pendingAttachments.map(a => ({
          id: a.id, name: a.name, mime: a.mime, dataUrl: a.dataUrl,
        })),
        meta: { lang, theme, ts: Date.now() },
      };

      const data = await postToN8N(payload);

      const normalized: Citation[] | undefined = data?.citations?.map((c: any, i: number) => ({
        n: typeof c.n === 'number' ? c.n : i + 1,
        title: c.title ?? 'Fuente',
        url: c.url ?? '',
      }));

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: uuid(),
          role: 'assistant',
          content: data?.reply ?? '(sin respuesta)',
          citations: normalized,
        };
        return updated;
      });

      const newTitle = data?.threadTitle || text || 'Mensaje con adjuntos';
      setThreads(ts =>
        ts.map(h =>
          h.id === activeThreadId
            ? { ...h, title: newTitle.slice(0, 42) + (newTitle.length > 42 ? '…' : ''), updatedAt: Date.now() }
            : h
        )
      );
    } catch (err: any) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: uuid(),
          role: 'assistant',
          content: `Problema contactando al servidor: ${err?.message || err}`,
        };
        return updated;
      });
    } finally {
      setBusy(false);
      setPendingAttachments([]);
      setPendingQR([]);
    }
  }

  // --- Finalizar chat
  const [showSummary, setShowSummary] = useState(false);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');

  // --- Ajustes visuales
  const contentRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerH, setFooterH] = useState(0);
  const [contentInsets, setContentInsets] = useState<{ left: number; right: number }>({ left: 0, right: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const el = contentRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const left = Math.max(0, Math.round(r.left + window.scrollX));
      const right = Math.max(0, Math.round(window.innerWidth - r.right + window.scrollX));
      setContentInsets({ left, right });
      setFooterH(footerRef.current?.offsetHeight ?? 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
    };
  }, []);

  // --- Render
  return (
    <div
      ref={contentRef}
      className={`flex flex-col min-h-[100dvh] overflow-hidden w-full ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Botón de nuevo chat */}
      <div className="flex justify-end px-3 sm:px-4 pt-3">
        <button
  type="button"
  onClick={newChat}
  className="px-3 py-1.5 rounded-lg border text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
  title={t(lang, 'chat', 'newChat') || 'Nuevo chat'}
>
  ＋ Nuevo chat
</button>

      </div>

      {/* Mensajes */}
      <div
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3"
        style={{ paddingBottom: `calc(${footerH}px + 12px)` }}
      >
        {messages.length > 0 ? (
          messages.map(msg => <MessageBubble key={msg.id} message={msg} theme={theme} />)
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-[90%] text-base sm:text-lg opacity-80 leading-snug">
              {t(lang, 'chat', 'emptyState')}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        ref={footerRef}
        className={`fixed bottom-0 z-40 bg-inherit border-t ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}
        style={{ left: contentInsets.left, right: contentInsets.right }}
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
          className="w-full px-3 sm:px-4 pt-3 pb-4 sm:pb-5"
        >
          {/* Input y botones */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-2 w-full">
  {/* ＋ ancla */}
  <div className="relative shrink-0">
    <button
      ref={anchorRef}
      type="button"
      onClick={() => setShowTools((s) => !s)}
      className="text-xl sm:text-2xl px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      aria-haspopup="menu"
      aria-expanded={showTools}
      title="+"
    >
      ＋
    </button>
  </div>

  {/* Menú flotante en portal */}
  {showTools && menuPos && createPortal(
    <>
      {/* overlay para cerrar al hacer click fuera */}
      <div className="fixed inset-0 z-[60]" onClick={() => setShowTools(false)} />

      <div
        ref={menuRef}
        className={`fixed z-[70] w-56 rounded-xl border shadow-lg ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        } max-h-[60vh] overflow-auto`}
        role="menu"
        style={{ top: menuPos.top, left: menuPos.left }}
      >
        <button
          type="button"
          onClick={() => { setShowTools(false); setShowCamera(true); }}
          className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-xl flex items-center gap-2"
          role="menuitem"
        >
          {t(lang, 'locator', 'takePhoto') || 'Tomar foto'}
        </button>

        <button
          type="button"
          onClick={() => { setShowTools(false); setShowQR(true); }}
          className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-b-xl flex items-center gap-2"
          role="menuitem"
        >
          {t(lang, 'locator', 'scanQR') || 'Escanear QR'}
        </button>
      </div>
    </>,
    document.body
  )}

  {/* Input */}
  <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder={t(lang, 'chat', 'placeholder')}
    className={`flex-1 min-w-0 px-3 py-2 rounded-xl border text-sm sm:text-base ${
      theme === 'dark'
        ? 'bg-slate-800 border-slate-700 text-slate-100'
        : 'bg-white border-slate-300 text-slate-900'
    } focus:outline-none`}
  />
</div>


            <div className="mt-2 sm:mt-0 flex w-full sm:w-auto justify-end sm:justify-start gap-2">
              <button
                type="submit"
                disabled={busy}
                className="px-3 sm:px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm sm:text-base disabled:opacity-50"
              >
                {t(lang, 'chat', 'send')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const userFirst = messages.find(m => m.role === 'user')?.content ?? t(lang, 'chat', 'title');
                  setShowSummary(true);
                  setTitle(`${t(lang, 'summary', 'autoTitlePrefix')} ${userFirst.slice(0, 40)}`);
                  setAbstract(`${t(lang, 'summary', 'autoDescPrefix')} "${userFirst}".`);
                }}
                className="px-3 sm:px-4 py-2 rounded-xl border font-semibold text-sm sm:text-base"
              >
                {t(lang, 'chat', 'end')}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modales */}
      <CameraModal
        open={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(file: Attachment) => {
          setPendingAttachments(p => [...p, file]);
          setShowCamera(false);
        }}
      />
      <QrScannerModal
        open={showQR}
        onClose={() => setShowQR(false)}
        onResult={(code: string) => {
          setPendingQR(p => [...p, code]);
          setShowQR(false);
        }}
      />

      <ChatSummaryModal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        onSubmit={data => {
          console.log('Resumen guardado:', data);
          setShowSummary(false);
          setMessages([]);
        }}
        defaultTitle={title}
        defaultDescription={abstract}
        theme={theme}
      />
    </div>
  );
}
