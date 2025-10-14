import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Citation, Message, Theme, Attachment } from '../../lib/types';
import { LS, loadJSON, saveJSON, uuid } from '../../lib/storage';
import MessageBubble from './MessageBubble';
import ChatSummaryModal from './ChatSummaryModal';
import type { Lang } from '../../lib/i18n';
import { t } from '../../lib/i18n';

import CameraModal from './CameraModal';
import QrScannerModal from './QrScannerModal';

export default function RAGChat({
  context,
  forceThreadId,
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

  const [activeThreadId] = useState<string>(threads[0].id);
  const [messages, setMessages] = useState<Message[]>(
    () => loadJSON<Message[]>(LS.messages(activeThreadId), [])
  );
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  // --- Adjuntos / QR
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [pendingQR, setPendingQR] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // --- Menú ＋ con portal y clamp a viewport
  const [showTools, setShowTools] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => saveJSON(LS.threads, threads), [threads]);
  useEffect(() => saveJSON(LS.messages(activeThreadId), messages), [activeThreadId, messages]);
  useEffect(() => setMessages(loadJSON<Message[]>(LS.messages(activeThreadId), [])), [activeThreadId]);

  // Calcula posición inicial (abajo-izq del botón) y la clampa horizontalmente
  useEffect(() => {
    if (!showTools || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const margin = 8;
    const approxWidth = 224; // ≈ w-56
    let left = r.left + window.scrollX;
    left = Math.min(Math.max(left, margin + window.scrollX), vw - approxWidth - margin + window.scrollX);
    const top = r.bottom + window.scrollY + margin; // abajo por defecto
    setMenuPos({ top, left });
  }, [showTools]);

  // Ajusta verticalmente después de montar el menú (si no cabe abajo, lo muestra arriba)
  useEffect(() => {
    if (!showTools || !menuRef.current || !anchorRef.current) return;
    const m = menuRef.current.getBoundingClientRect();
    const vwH = window.innerHeight;
    const margin = 8;

    if (m.bottom > vwH - margin) {
      const btn = anchorRef.current.getBoundingClientRect();
      const newTop = btn.top + window.scrollY - m.height - margin; // arriba del botón
      setMenuPos((pos) => (pos ? { ...pos, top: newTop } : pos));
    }
  }, [showTools]);

  // Reposiciona si hay scroll/resize con el menú abierto
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

  // --- Envío (incluye adjuntos y QRs)
  async function sendMessage() {
    const text = input.trim();
    if ((!text && pendingAttachments.length === 0 && pendingQR.length === 0) || busy) return;

    setInput('');
    setBusy(true);

    const qrBlock = pendingQR.length ? `\n\nQR:\n${pendingQR.map((q) => `• ${q}`).join('\n')}` : '';

    const userMsg: Message = {
      id: uuid(),
      role: 'user',
      content: `${text || ''}${qrBlock}`,
      attachments: pendingAttachments.length ? pendingAttachments : undefined,
    };

    const loading: Message = { id: uuid(), role: 'assistant', content: t(lang, 'chat', 'thinking') };
    setMessages((p) => [...p, userMsg, loading]);

    try {
      // DEMO (sin backend)
      await new Promise((r) => setTimeout(r, 350));
      const citations: Citation[] = pendingQR.map((q, i) => ({ n: i + 1, title: 'Código QR', url: q }));

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: uuid(),
          role: 'assistant',
          content: `(Demo) Procesé ${pendingAttachments.length} adjunto(s) y ${pendingQR.length} código(s) QR.`,
          citations,
        };
        return updated;
      });

      setThreads((ts) =>
        ts.map((h) =>
          h.id === activeThreadId
            ? {
                ...h,
                title: (text || 'Mensaje con adjuntos').slice(0, 42) + ((text || '').length > 42 ? '…' : ''),
                updatedAt: Date.now(),
              }
            : h
        )
      );
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
  function handleEndChat() {
    const userFirst = messages.find((m) => m.role === 'user')?.content ?? t(lang, 'chat', 'title');
    const aiTitle = `${t(lang, 'summary', 'autoTitlePrefix')} ${userFirst.slice(0, 40)}`;
    const aiDesc = `${t(lang, 'summary', 'autoDescPrefix')} "${userFirst}".`;
    setShowSummary(true); setTitle(aiTitle); setAbstract(aiDesc);
  }

  return (
    <div
      className={`flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-full ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3">
        {messages.length > 0 ? (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} theme={theme} />)
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-[90%] text-base sm:text-lg opacity-80 leading-snug">
              {t(lang, 'chat', 'emptyState')}
            </div>
          </div>
        )}
      </div>

      {/* Input inferior (responsive y sin desbordes) */}
      <div className={`border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} bg-inherit`}>
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex flex-col gap-2 px-3 sm:px-4 py-2 sm:py-3 w-full"
        >
          {(pendingAttachments.length > 0 || pendingQR.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {pendingAttachments.map((a) => (
                <div key={a.id} className="flex items-center gap-2 border rounded-xl px-2 py-1 text-xs sm:text-sm">
                  {a.mime.startsWith('image/') ? (
                    <img src={a.dataUrl} alt={a.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded object-cover border" />
                  ) : (
                    <span className="text-[10px] sm:text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">FILE</span>
                  )}
                  <span className="max-w-[120px] sm:max-w-[160px] truncate">{a.name}</span>
                  <button
                    type="button"
                    aria-label="Eliminar adjunto"
                    onClick={() => setPendingAttachments((p) => p.filter((x) => x.id !== a.id))}
                    className="opacity-70 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {pendingQR.map((q, idx) => (
                <div key={`qr-${idx}`} className="flex items-center gap-2 border rounded-xl px-2 py-1 text-xs sm:text-sm">
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30">QR</span>
                  <span className="max-w-[160px] sm:max-w-[220px] truncate">{q}</span>
                  <button
                    type="button"
                    aria-label="Eliminar QR"
                    onClick={() => setPendingQR((p) => p.filter((_, i) => i !== idx))}
                    className="opacity-70 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

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
              >
                ＋
              </button>
            </div>

            {/* Menú en portal */}
            {showTools && menuPos && createPortal(
              <>
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
                    📷 {t(lang, 'locator', 'takePhoto')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowTools(false); setShowQR(true); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-b-xl flex items-center gap-2"
                    role="menuitem"
                  >
                    🔍 {t(lang, 'locator', 'scanQR')}
                  </button>
                </div>
              </>,
              document.body
            )}

            {/* Input (clave: min-w-0 para poder encoger) */}
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

            {/* Botones (no crecen) */}
            <div className="flex gap-2 shrink-0">
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
                  const userFirst = messages.find((m) => m.role === 'user')?.content ?? t(lang, 'chat', 'title');
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
          setPendingAttachments((p) => [...p, file]);
          setShowCamera(false);
        }}
      />
      <QrScannerModal
        open={showQR}
        onClose={() => setShowQR(false)}
        onResult={(code: string) => {
          setPendingQR((p) => [...p, code]);
          setShowQR(false);
        }}
      />

      {/* Resumen */}
      <ChatSummaryModal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        onSubmit={(data) => { console.log('Resumen guardado:', data); setShowSummary(false); setMessages([]); }}
        defaultTitle={title}
        defaultDescription={abstract}
        theme={theme}
      />
    </div>
  );
}
