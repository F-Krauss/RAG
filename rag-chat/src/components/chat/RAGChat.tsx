import React, { useEffect, useRef, useState } from 'react';
import type { Attachment, Citation, Message, Settings, Theme } from '../../lib/types';
import { LS, fileToBase64, loadJSON, mdEscape, saveJSON, trimHistory, uuid } from '../../lib/storage';
import CameraModal from './CameraModal';
import { Bubble, Citations } from './MessageBubble';

export default function RAGChat({
  context,
  forceThreadId,
  theme,
  t,
}: {
  context?: { plant?: string; line?: string };
  forceThreadId?: string;
  theme: Theme;
  t: (k: string) => string;
}) {
  // Env defaults
  const envURL = (import.meta as any).env?.VITE_WEBHOOK_URL || '';
  const envKey = (import.meta as any).env?.VITE_API_KEY || '';

  // Settings
  const initialSettings: Settings = {
    enableStreaming: false,
    webhookUrl: envURL,
    apiKey: envKey,
    ...(loadJSON<Partial<Settings>>(LS.settings, {} as Partial<Settings>)),
  } as Settings;
  const [settings, setSettings] = useState<Settings>(initialSettings);

  // Threads
  const initialThreads = loadJSON(LS.threads, [] as any[]);
  const [threads, setThreads] = useState(() => {
    if (initialThreads.length) return initialThreads;
    const t0 = {
      id: uuid(),
      title: 'Nueva conversación',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveJSON(LS.threads, [t0]);
    return [t0];
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0].id);

  // Messages
  const [messages, setMessages] = useState<Message[]>(() =>
    loadJSON<Message[]>(LS.messages(threads[0].id), []),
  );

  // UI state
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [camOpen, setCamOpen] = useState(false);

  // Refs
  const chatRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  // Persist + side-effects
  useEffect(() => saveJSON(LS.settings, settings), [settings]);
  useEffect(() => saveJSON(LS.threads, threads), [threads]);
  useEffect(() => saveJSON(LS.messages(activeThreadId), messages), [activeThreadId, messages]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    setMessages(loadJSON<Message[]>(LS.messages(activeThreadId), []));
  }, [activeThreadId]);

  useEffect(() => {
    if (forceThreadId && threads.find((t: any) => t.id === forceThreadId)) {
      setActiveThreadId(forceThreadId);
    }
  }, [forceThreadId, threads]);

  // Files -> attachments
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const arr: Attachment[] = [];
    for (const f of Array.from(files)) {
      const b64 = await fileToBase64(f);
      arr.push({
        id: uuid(),
        name: f.name,
        type: f.type || 'application/octet-stream',
        size: f.size,
        b64,
      });
    }
    setAttachments((p) => [...p, ...arr]);
  };

  async function sendMessage() {
    const text = input.trim();
    if ((!text && attachments.length === 0) || busy) return;

    setInput('');

    // Mensaje del usuario con ID
    const userMsg: Message = {
      id: uuid(),
      role: 'user',
      content: text || '(Adjunto)',
    };

    // Mensaje "pensando…" con ID propio
    const loadingMsg: Message = {
      id: uuid(),
      role: 'assistant',
      content: 'Pensando…',
    };

    // Construimos historial incluyendo el mensaje del usuario
    const historyToSend = trimHistory([...messages, userMsg]);

    // Pinta en UI (user + loading)
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setBusy(true);

    const imagesB64 = attachments
      .filter((a) => a.type.startsWith('image/'))
      .map((a) => a.b64!)
      .filter(Boolean);

    // Demo local sin webhook
    if (!settings.webhookUrl) {
      await new Promise((r) => setTimeout(r, 500));
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1]; // loading
        next[next.length - 1] = {
          ...last,
          content: `(Demo) ${t('chat')} · ${context?.plant || '-'} / ${context?.line || '-'}.`,
          citations: [{ n: 1, title: 'Doc', url: 'https://example.com' }],
        };
        return next;
      });
      // Actualiza título/updatedAt en el primer intercambio
      setThreads((ts: any[]) =>
        ts.map((th) =>
          th.id === activeThreadId
            ? {
                ...th,
                title:
                  (text || attachments[0]?.name || 'Nueva conversación').slice(0, 42) +
                  ((text || attachments[0]?.name || '').length > 42 ? '…' : ''),
                updatedAt: Date.now(),
              }
            : th,
        ),
      );
      setAttachments([]);
      setBusy(false);
      return;
    }

    try {
      const body = {
        thread_id: activeThreadId,
        user_id: 'browser',
        message: text,
        history: historyToSend,
        context,
        attachments: attachments.map((a) => ({
          name: a.name,
          type: a.type,
          size: a.size,
          b64: a.b64,
        })),
        images_base64: imagesB64,
      };

      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 30000);

      const res = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiKey ? { 'X-API-Key': settings.apiKey } : {}),
        },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });

      clearTimeout(to);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const answer = String(data.answer ?? '');
      const citations: Citation[] = Array.isArray(data.citations) ? data.citations : [];

      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1]; // loading
        next[next.length - 1] = { ...last, content: answer, citations };
        return next;
      });

      // Primer intercambio -> fija título y updatedAt
      setThreads((ts: any[]) =>
        ts.map((th) =>
          th.id === activeThreadId
            ? {
                ...th,
                title:
                  prevTitleNeeded(messages) // antes de enviar teníamos 0 mensajes del assistant
                    ? buildTitle(text, attachments[0]?.name)
                    : th.title,
                updatedAt: Date.now(),
              }
            : th,
        ),
      );
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1]; // loading
        next[next.length - 1] = {
          ...last,
          content: `Error al obtener respuesta. ${e?.message || ''}`,
        };
        return next;
      });
    } finally {
      setBusy(false);
      setAttachments([]);
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="h-full grid grid-rows-[auto,1fr,auto]">
      {/* Top */}
      <div
        className={`flex items-center justify-between p-3 border-b ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        } ${theme === 'dark' ? 'bg-transparent' : 'bg-white'}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">
            {t('chat')} · {context?.plant || '—'} / {context?.line || '—'}
          </span>
        </div>
      </div>

      {/* Mensajes */}
      <div ref={chatRef} className="overflow-auto p-4 space-y-3">
        {!messages.length && <div className="opacity-70 text-sm">👋 {t('placeholder')}</div>}
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} theme={theme}>
            <div dangerouslySetInnerHTML={{ __html: mdEscape(m.content) }} />
            <Citations list={m.citations} />
          </Bubble>
        ))}
      </div>

      {/* Composer */}
      <div className={`${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} border-t p-3`}>
        <div
          className="flex flex-col gap-2"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={async (e) => {
            e.preventDefault();
            await onFiles(e.dataTransfer.files);
          }}
        >
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className={`${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
                  } px-2 py-1 rounded border text-xs flex items-center gap-2`}
                >
                  <span className="max-w-[160px] truncate" title={a.name}>
                    {a.name}
                  </span>
                  <button
                    className="opacity-70 hover:opacity-100"
                    onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <button
              className={`${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
              } px-3 py-2 rounded-xl border`}
              onClick={() => fileRef.current?.click()}
            >
              {t('adjuntar')}
            </button>
            <button
              className={`${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
              } px-3 py-2 rounded-xl border`}
              onClick={() => camRef.current?.click()}
            >
              {t('foto')}
            </button>
            <button
              className={`${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
              } px-3 py-2 rounded-xl border`}
              onClick={() => setCamOpen(true)}
            >
              📷 {t('tomarFoto')}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('placeholder')}
              className={`${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
              } flex-1 resize-none rounded-xl border outline-none px-3 py-2 min-h-[44px] max-h-[180px]`}
            />
            <button
              onClick={() => void sendMessage()}
              disabled={busy || (!input.trim() && attachments.length === 0)}
              className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50"
            >
              {t('enviar')}
            </button>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            <input
              ref={camRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>
          <div className="text-[11px] opacity-60">
            {t('drop')} {navigator.mediaDevices ? '' : ' (tu navegador no soporta cámara)'}.
          </div>
        </div>
      </div>

      <CameraModal
        open={camOpen}
        onClose={() => setCamOpen(false)}
        onCapture={(file) => setAttachments((prev) => [...prev, file])}
      />
    </div>
  );
}

/* Utils locales */
function prevTitleNeeded(existing: Message[]) {
  // Si antes de enviar sólo había (como mucho) mensajes del usuario,
  // deja que el primer turno ponga título.
  return existing.filter((m) => m.role === 'assistant').length === 0;
}

function buildTitle(text?: string, fallbackName?: string) {
  const base = text || fallbackName || 'Nueva conversación';
  return base.length > 42 ? base.slice(0, 42) + '…' : base;
}
